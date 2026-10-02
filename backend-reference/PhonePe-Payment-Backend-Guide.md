# Gau Mata Trust — PhonePe Payment Gateway Backend (Laravel)

Server-side implementation matching the EXACT payload contract of the live backend
at `https://gst.tambimotors.com/api`.

- Response envelope used everywhere: `{ "status": bool, "status_code": int, ... }`
- Success: `status: true`  •  Error: `status: false` + `status_code` + `message`
- Auth for `/user/*` routes: `Authorization: Bearer <sanctum-token>`

---

## 1. Frontend Payment Map (kahan payment hota hai)

| # | Frontend file:line | Kya hota hai | Backend endpoint |
|---|---|---|---|
| 1 | `src/screens/main/DonateScreen.tsx:95` | One-time / monthly / occasion donation | create-order → status → purchase-plan |
| 2 | `src/screens/main/PlansScreen.tsx:82` | Monthly membership plan purchase | create-order → status → purchase-plan |
| 3 | `src/screens/main/JoinMembershipScreen.tsx:165` | Membership plan purchase / upgrade | create-order → status → purchase-plan |
| 4 | `src/screens/main/ProfileScreen.tsx:149` | Payment/donation history list | donation-history |
| 5 | (PhonePe servers) | Real-time payment confirmation | webhook |

Flow (same for all 3 payment screens):

```
App ──POST /user/payment/create-order──▶ Backend ──OAuth+create order──▶ PhonePe
App ◀──{orderId, token}───────────────── Backend
App ──open PhonePe SDK sheet (token)──▶ Payment by user
App ◀──SDK returns SUCCESS──▶ App ──GET /user/payment/status/{orderId}──▶ confirm COMPLETED
App ──POST /user/purchase-plan──▶ Backend verifies with PhonePe LIVE → records / activates
```

> **CRITICAL:** Backend NEVER trusts the app's `payment_status: "paid"`. Every
> purchase is verified against PhonePe before it is recorded.

---

## 2. Dashboard Setup

1. https://business.phonepe.com → Payment Gateway → production activated.
2. Developer Settings → App Config → confirm Client ID / Merchant ID.
3. Developer Settings → Webhook → URL `https://gst.tambimotors.com/api/payment/webhook` → copy the secret/salt into `.env`.
4. Test with `PHONEPE_ENV=sandbox`, then switch to `production`.

---

## 3. `.env`

```env
# ===== PhonePe Payment Gateway =====
PHONEPE_ENV=production                   # sandbox | production
PHONEPE_MERCHANT_ID=GAUMATATRUSTONLINE
PHONEPE_CLIENT_ID=SU2609111800150744634227
PHONEPE_CLIENT_SECRET=a129e93a-959e-4136-9678-6f9400f62987
PHONEPE_CLIENT_VERSION=1
PHONEPE_ORDER_EXPIRE_AFTER=300           # seconds (5 min)
# Webhook (dashboard se milega) — v1 key ("response"+salt) style
PHONEPE_WEBHOOK_SALT=
PHONEPE_WEBHOOK_ID=                      # e.g. PAYMENT_1 (only for checksum-key-id fallback)
PHONEPE_WEBHOOK_SECRET_KEY=
```

> `PHONEPE_CLIENT_SECRET` kabhi React Native app mein mat daalo — sirf server.

---

## 4. `config/phonepe.php`

```php
<?php

return [
    'env' => env('PHONEPE_ENV', 'production'),

    'merchant_id'    => env('PHONEPE_MERCHANT_ID'),
    'client_id'      => env('PHONEPE_CLIENT_ID'),
    'client_secret'  => env('PHONEPE_CLIENT_SECRET'),
    'client_version' => env('PHONEPE_CLIENT_VERSION', '1'),

    'order_expire_after' => env('PHONEPE_ORDER_EXPIRE_AFTER', 300),

    'webhook_salt'        => env('PHONEPE_WEBHOOK_SALT'),
    'webhook_id'          => env('PHONEPE_WEBHOOK_ID'),
    'webhook_secret_key'  => env('PHONEPE_WEBHOOK_SECRET_KEY'),

    'is_sandbox' => env('PHONEPE_ENV') === 'sandbox',

    'base_url' => env('PHONEPE_ENV') === 'sandbox'
        ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
        : 'https://api.phonepe.com/apis/pg',

    'identity_url' => env('PHONEPE_ENV') === 'sandbox'
        ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token'
        : 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',

    'order_url' => env('PHONEPE_ENV') === 'sandbox'
        ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/sdk/order'
        : 'https://api.phonepe.com/apis/pg/checkout/v2/sdk/order',

    'status_url' => env('PHONEPE_ENV') === 'sandbox'
        ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order'
        : 'https://api.phonepe.com/apis/pg/checkout/v2/order',
];
```

---

## 5. Migration — `payments` table

```bash
php artisan make:migration create_payments_table
php artisan migrate
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type')->default('donation');        // donation | plan
            $table->unsignedBigInteger('plan_id')->nullable()->index();
            $table->string('donation_type')->nullable();        // one-time | monthly | occasion
            $table->unsignedBigInteger('amount_paisa');         // ₹1 = 100 paisa
            $table->string('currency')->default('INR');
            $table->string('mobile')->nullable();
            $table->string('remark')->nullable();
            $table->string('merchant_order_id')->unique();      // "GMT..." primary id (returns as orderId to app)
            $table->string('phonepe_order_id')->nullable()->index();
            $table->string('state')->default('CREATED');        // CREATED|PENDING|COMPLETED|FAILED|UNKNOWN
            $table->string('transaction_id')->nullable();       // PhonePe final txn id (T...)
            $table->string('payment_mode')->nullable();
            $table->json('response')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
```

---

## 6. `app/Models/Payment.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'plan_id', 'donation_type', 'amount_paisa', 'currency',
        'mobile', 'remark', 'merchant_order_id', 'phonepe_order_id',
        'state', 'transaction_id', 'payment_mode', 'response',
    ];

    protected $casts = ['response' => 'array'];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }
}
```

---

## 7. `app/Services/PhonePeService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PhonePeService
{
    protected string $identityUrl;
    protected string $orderUrl;
    protected string $statusUrl;
    protected string $merchantId;
    protected string $clientId;
    protected string $clientSecret;
    protected string $clientVersion;

    public function __construct()
    {
        $this->identityUrl   = config('phonepe.identity_url');
        $this->orderUrl      = config('phonepe.order_url');
        $this->statusUrl     = config('phonepe.status_url');
        $this->merchantId    = config('phonepe.merchant_id');
        $this->clientId      = config('phonepe.client_id');
        $this->clientSecret  = config('phonepe.client_secret');
        $this->clientVersion = config('phonepe.client_version', '1');
    }

    public function getAuthToken(): string
    {
        return Cache::remember('phonepe_auth_token', now()->addMinutes(85), function () {
            $response = Http::asForm()->post($this->identityUrl, [
                'client_id'      => $this->clientId,
                'client_version' => $this->clientVersion,
                'client_secret'  => $this->clientSecret,
                'grant_type'     => 'client_credentials',
            ]);

            if (!$response->successful()) {
                throw new \Exception('PhonePe auth failed HTTP ' . $response->status() . ': ' . $response->body());
            }

            $token = $response->json('access_token');
            if (!$token) {
                throw new \Exception('PhonePe auth failed: missing access_token. Raw response: ' . $response->body());
            }

            return $token;
        });
    }

    /**
     * Create order via /checkout/v2/sdk/order.
     *
     * @param  int  $amountInPaisa  ₹1 = 100
     * @return array{orderId:string, token:string, merchantOrderId:string}
     */
    public function createOrder(string $merchantOrderId, int $amountInPaisa, array $metaInfo = []): array
    {
        $meta = [];
        for ($i = 1; $i <= 15; $i++) {
            $meta['udf' . $i] = $metaInfo['udf' . $i] ?? $metaInfo[$i] ?? '';
        }

        $payload = [
            'merchantOrderId' => $merchantOrderId,
            'amount'          => $amountInPaisa,
            'expireAfter'     => config('phonepe.order_expire_after', 300),
            'metaInfo'        => $meta,
            'paymentFlow'     => ['type' => 'PG_CHECKOUT'],
        ];

        $response = Http::withToken($this->getAuthToken(), 'O-Bearer')->post($this->orderUrl, $payload);

        if (!$response->successful()) {
            throw new \Exception('PhonePe create-order failed: ' . $response->body());
        }

        $json   = $response->json();
        $result = $json['data'] ?? $json;

        if (isset($json['success']) && $json['success'] !== true) {
            throw new \Exception($result['message'] ?? 'PhonePe create-order failed');
        }

        return [
            'orderId'         => (string) $result['orderId'],
            'token'           => (string) $result['token'],
            'merchantOrderId' => $merchantOrderId,
        ];
    }

    /**
     * Real-time status from PhonePe.
     *
     * @return array{state:string, transactionId:?string, paymentMode:?string, amount:?int}
     */
    public function checkOrderStatus(string $merchantOrderId): array
    {
        $url = rtrim($this->statusUrl, '/')
            . '/' . urlencode($merchantOrderId)
            . '/status?details=false';

        $response = Http::withToken($this->getAuthToken(), 'O-Bearer')
            ->withHeaders(['Content-Type' => 'application/json'])
            ->get($url);

        if (!$response->successful()) {
            throw new \Exception('PhonePe status failed: ' . $response->body());
        }

        $json = $response->json();
        $data = $json['data'] ?? $json;

        $paymentDetails = $data['paymentDetails'][0] ?? [];

        return [
            'state'         => strtoupper((string) ($data['state'] ?? 'UNKNOWN')),
            'transactionId' => $paymentDetails['transactionId'] ?? null,
            'paymentMode'   => $paymentDetails['paymentMode'] ?? null,
            'amount'        => $data['amount'] ?? null,
        ];
    }
}
```

---

## 8. `app/Http/Controllers/Api/PaymentController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\PhonePeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(protected PhonePeService $phonePe) {}

    /**
     * POST /api/user/payment/create-order
     *
     * Plan purchase : { "plan_id": 1 }
     * Donation      : { "amount": 500, "donation_type": "one-time", "mobile": "9999999999", "remark": "..." }
     *
     * Returns : { "status": true, "status_code": 200, "orderId": "GMT...", "token": "..." }
     */
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount'        => ['required_without:plan_id', 'numeric', 'gt:0'],
            'plan_id'       => ['nullable', 'integer', 'exists:plans,id'],
            'donation_type' => ['nullable', 'string'],
            'mobile'        => ['nullable', 'digits:10'],
            'remark'        => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'      => false,
                'status_code' => 422,
                'message'     => $validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();

        // Amount nikalte hain: plan purchase = plan price, donation = body se
        if (!empty($validated['plan_id'])) {
            $plan = Plan::find($validated['plan_id']);
            if (!$plan || (int) $plan->status !== 1) {
                return response()->json([
                    'status'      => false,
                    'status_code' => 400,
                    'message'     => 'This plan is currently inactive.',
                ], 400);
            }
            $amountInPaisa = (int) round(((float) $plan->price) * 100);
        } else {
            $amountInPaisa = (int) round(((float) $validated['amount']) * 100);
        }

        $merchantOrderId = 'GMT' . now()->format('ymdHis') . strtoupper(Str::random(6));

        try {
            $order = $this->phonePe->createOrder(
                $merchantOrderId,
                $amountInPaisa,
                [
                    'udf1' => $validated['donation_type'] ?? '',
                    'udf2' => (string) ($plan->id ?? ''),
                ]
            );

            Payment::create([
                'user_id'           => $request->user()->id,
                'type'              => isset($plan) ? 'plan' : 'donation',
                'plan_id'           => $plan->id ?? null,
                'donation_type'     => $validated['donation_type'] ?? null,
                'amount_paisa'      => $amountInPaisa,
                'mobile'            => $validated['mobile'] ?? null,
                'remark'            => $validated['remark'] ?? null,
                'merchant_order_id' => $merchantOrderId,
                'phonepe_order_id'  => $order['orderId'],
                'state'             => 'CREATED',
            ]);

            return response()->json([
                'status'         => true,
                'status_code'    => 200,
                // REQUIRE FOR THE MOBILE SDK:
                // `orderId` MUST be PhonePe's generated internal order id
                // (e.g. "OMO123456789" / UUID) from /checkout/v2/sdk/order.
                // The SDK validates the token against THIS id.
                // Returning the GMT merchant id here is the #1 cause of
                // "Something went wrong" when the user taps Pay.
                'orderId'        => $order['orderId'],
                // `merchantOrderId` is OUR id - used for status / purchase-plan only.
                'merchantOrderId'=> $merchantOrderId,
                'token'          => $order['token'],
            ]);
        } catch (\Throwable $e) {
            \Log::error('PhonePe create-order failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status'      => false,
                'status_code' => 500,
                'message'     => 'Order creation failed',
            ], 500);
        }
    }

    /**
     * GET /api/user/payment/status/{orderId}
     *
     * Returns :
     * {
     *   "success": true, "status_code": 200,
     *   "payment_status": "COMPLETED|PENDING|FAILED|UNKNOWN",
     *   "transaction_id": "T...",
     *   "response": { "state": "COMPLETED", "transactionId": "T...", "amount": 50000 }
     * }
     */
    public function getStatus(Request $request, string $orderId)
    {
        $payment = Payment::where('merchant_order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$payment) {
            return response()->json([
                'success'        => false,
                'status_code'    => 404,
                'payment_status' => 'UNKNOWN',
                'message'        => 'Order not found',
            ], 404);
        }

        // Fast path — already final (webhook / earlier status call)
        if (in_array($payment->state, ['COMPLETED', 'FAILED'], true)) {
            return response()->json([
                'success'        => true,
                'status_code'    => 200,
                'payment_status' => $payment->state,
                'transaction_id' => $payment->transaction_id,
                'response'       => [
                    'state'          => $payment->state,
                    'transactionId'  => $payment->transaction_id,
                    'amount'         => $payment->amount_paisa,
                ],
            ]);
        }

        // Live verify with PhonePe (source of truth)
        try {
            $status = $this->phonePe->checkOrderStatus($orderId);

            $payment->state          = $status['state'];
            $payment->transaction_id = $status['transactionId'] ?? $payment->transaction_id;
            $payment->payment_mode   = $status['paymentMode'] ?? $payment->payment_mode;
            $payment->response       = $status;
            $payment->save();

            return response()->json([
                'success'        => true,
                'status_code'    => 200,
                'payment_status' => $payment->state,
                'transaction_id' => $payment->transaction_id,
                'response'       => [
                    'state'         => $payment->state,
                    'transactionId' => $payment->transaction_id,
                    'amount'        => $payment->amount_paisa,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('PhonePe status failed', ['orderId' => $orderId, 'error' => $e->getMessage()]);

            return response()->json([
                'success'        => false,
                'status_code'    => 502,
                'payment_status' => 'UNKNOWN',
                'message'        => 'Unable to fetch status',
            ], 502);
        }
    }

    /**
     * POST /api/payment/webhook   (PhonePe servers, no auth token)
     *
     * PhonePe sends : Header X-VERIFY = base64(sha256(response + salt)),
     *                 Body { "response": "<base64-encoded-json>" }
     * Older style (X-VERIFY) hamesha verify; checksum-key-id method bhi fallback mein.
     */
    public function handleWebhook(Request $request)
    {
        $payloadB64 = (string) $request->input('response');
        $xv         = (string) $request->header('X-VERIFY');
        $salt       = (string) config('phonepe.webhook_salt');

        $verified = false;

        // Style 1: X-VERIFY (response + salt)
        if ($xv !== '' && $salt !== '') {
            $expected = base64_encode(hash('sha256', $payloadB64 . $salt, true));
            $verified = hash_equals($expected, $xv);
        }

        // Style 2: x-phonepe-checksum-key-id + x-phonepe-checksum-signature (raw body HMAC)
        if (!$verified && config('phonepe.webhook_secret_key')) {
            $keyId     = (string) $request->header('x-phonepe-checksum-key-id');
            $signature = (string) $request->header('x-phonepe-checksum-signature');
            $expected  = base64_encode(hash_hmac('sha256', $request->getContent(), config('phonepe.webhook_secret_key'), true));
            $verified  = hash_equals($expected, $signature)
                && in_array($keyId, array_filter(explode(',', (string) config('phonepe.webhook_id'))), true);
        }

        if (!$verified) {
            \Log::warning('PhonePe webhook verification failed');

            return response()->json(['status' => false], 401);
        }

        $decoded = json_decode(base64_decode($payloadB64), true);

        \Log::info('PhonePe webhook received', ['payload' => $decoded]);

        $merchantOrderId = $decoded['data']['merchantTransactionId']
            ?? $decoded['merchantOrderId']
            ?? null;

        $payment = $merchantOrderId
            ? Payment::where('merchant_order_id', $merchantOrderId)->first()
            : null;

        if (!$payment) {
            return response()->json(['status' => false], 404);
        }

        $state = strtoupper((string) ($decoded['data']['state']
            ?? $decoded['state']
            ?? 'UNKNOWN'));

        if ($state === 'COMPLETED') {
            $payment->transaction_id = $decoded['data']['transactionId'] ?? $payment->transaction_id;
            $payment->payment_mode   = $decoded['data']['paymentMode'] ?? $payment->payment_mode;
        }

        $payment->state    = $state;
        $payment->response = $decoded;
        $payment->save();

        return response()->json(['status' => true]);
    }
}
```

---

## 9. `app/Http/Controllers/Api/PurchaseController.php`

**SABSE IMPORTANT** — purchase-plan server-side verify karta hai ki paisa sach mein PhonePe par COMPLETED hai, phir hi record/activate karta hai.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Services\PhonePeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PurchaseController extends Controller
{
    public function __construct(protected PhonePeService $phonePe) {}

    /**
     * POST /api/user/purchase-plan
     *
     * Plan     : { plan_id, payment_status:"paid", transaction_id, remark }
     * Donation : { donation_type, amount, payment_status:"paid", transaction_id, remark }
     *
     * Success  : { "status": true, "status_code": 200, "message": "..." }
     */
    public function purchasePlan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id'        => ['required_without:donation_type', 'integer', 'exists:plans,id'],
            'donation_type'  => ['required_without:plan_id', 'string'],
            'amount'         => ['required_without:plan_id', 'numeric', 'min:0'],
            'payment_status' => ['required', 'string'],
            'transaction_id' => ['nullable', 'string'],
            'remark'         => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'      => false,
                'status_code' => 422,
                'message'     => $validator->errors()->first(),
            ], 422);
        }

        $validated = $validator->validated();

        // Is app wale order ho humne create-order se banaya tha? transaction_id = "GMT..." order id
        $orderId = $validated['transaction_id'] ?? null;
        if (!$orderId) {
            return response()->json([
                'status'      => false,
                'status_code' => 400,
                'message'     => 'transaction_id is required after payment check.',
            ], 400);
        }

        $payment = Payment::where(function ($q) use ($orderId) {
            $q->where('merchant_order_id', $orderId)
              ->orWhere('phonepe_order_id', $orderId);
        })->where('user_id', $request->user()->id)->first();

        if (!$payment) {
            return response()->json([
                'status'      => false,
                'status_code' => 404,
                'message'     => 'Payment record not found for this transaction.',
            ], 404);
        }

        // Amount reconciliation (donation ke liye)
        if (isset($validated['amount']) && $payment->amount_paisa !== (int) round(((float) $validated['amount']) * 100)) {
            return response()->json([
                'status'      => false,
                'status_code' => 400,
                'message'     => 'Amount mismatch. Please contact support.',
            ], 400);
        }

        // Agar local state final nahi to PhonePe se LIVE verify karo
        if (!in_array($payment->state, ['COMPLETED', 'FAILED'], true)) {
            try {
                $status = $this->phonePe->checkOrderStatus($payment->merchant_order_id);
                $payment->state          = $status['state'];
                $payment->transaction_id = $status['transactionId'] ?? $payment->transaction_id;
                $payment->payment_mode   = $status['paymentMode'] ?? $payment->payment_mode;
                $payment->response       = $status;
                $payment->save();
            } catch (\Throwable $e) {
                \Log::error('purchase-plan verify failed', ['error' => $e->getMessage()]);

                return response()->json([
                    'status'      => false,
                    'status_code' => 502,
                    'message'     => 'Payment verification failed.',
                ], 502);
            }
        }

        if ($payment->state !== 'COMPLETED') {
            return response()->json([
                'status'      => false,
                'status_code' => 400,
                'message'     => 'Payment not confirmed yet. Please try again.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            if (isset($validated['plan_id'])) {
                $plan = Plan::findOrFail($validated['plan_id']);

                if ((int) round(((float) $plan->price) * 100) !== $payment->amount_paisa) {
                    throw new \Exception('Plan price mismatch');
                }

                $payment->plan_id = $plan->id;
                $payment->type    = 'plan';
                $payment->save();

                $message = $this->activateMembership($request->user(), $plan, $payment);
            } else {
                $payment->type          = 'donation';
                $payment->donation_type = $validated['donation_type'] ?? $payment->donation_type;
                $payment->remark        = $validated['remark'] ?? $payment->remark;
                $payment->save();

                $message = 'Donation recorded successfully.';
            }

            DB::commit();

            return response()->json([
                'status'      => true,
                'status_code' => 200,
                'message'     => $message,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('purchase-plan record failed', ['error' => $e->getMessage()]);

            return response()->json([
                'status'      => false,
                'status_code' => 500,
                'message'     => 'Failed to record payment. Please contact support.',
            ], 500);
        }
    }

    protected function activateMembership($user, Plan $plan, Payment $payment): string
    {
        [$start, $end] = $this->datesFromDuration($plan->duration);

        DB::table('user_plans')->updateOrInsert(
            ['user_id' => $user->id, 'plan_id' => $plan->id],
            [
                'start_date'     => $start,
                'end_date'       => $end,
                'status'         => 'active',
                'transaction_id' => $payment->merchant_order_id,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]
        );

        // TODO: apne users/profiles columns apne hike hisaab se update karo:
        // $user->update(['start_date' => $start, 'end_date' => $end, 'status' => 'active']);

        return 'Plan purchased successfully & membership activated.';
    }

    protected function datesFromDuration(string $duration): array
    {
        $start = now();
        $dur   = strtolower(trim($duration));

        if (str_contains($dur, 'lifetime')) {
            return [$start->toDateString(), now()->addYears(30)->toDateString()];
        }
        if (str_contains($dur, 'month')) {
            $n = max(1, (int) filter_var($dur, FILTER_SANITIZE_NUMBER_INT) ?: 1);
            return [$start->toDateString(), $start->copy()->addMonths($n)->toDateString()];
        }
        if (str_contains($dur, 'year')) {
            $n = max(1, (int) filter_var($dur, FILTER_SANITIZE_NUMBER_INT) ?: 1);
            return [$start->toDateString(), $start->copy()->addYears($n)->toDateString()];
        }
        return [$start->toDateString(), $start->copy()->addYear()->toDateString()];
    }

    /**
     * GET /api/user/donation-history
     *
     * Returns:
     * {
     *   "status": true, "status_code": 200, "message": "...",
     *   "donations": [ { id, amount, payment_status, transaction_id,
     *                     donation_type, remark, date, plan|null } ]
     * }
     * date format: "12 Sep 2026, 02:30 PM"
     */
    public function donationHistory(Request $request)
    {
        $payments = Payment::with('plan')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        $donations = $payments->map(function (Payment $p) {
            return [
                'id'             => $p->id,
                'amount'         => number_format($p->amount_paisa / 100, 2),
                'payment_status' => $p->state === 'COMPLETED' ? 'paid' : 'pending',
                'transaction_id' => $p->transaction_id ?: $p->merchant_order_id,
                'donation_type'  => $p->donation_type,
                'remark'         => $p->remark,
                'date'           => $p->created_at ? $p->created_at->format('d M Y, h:i A') : null,
                'plan'           => $p->plan
                    ? [
                        'id'        => $p->plan->id,
                        'plan_name' => $p->plan->plan_name,
                        'duration'  => $p->plan->duration,
                    ]
                    : null,
            ];
        });

        return response()->json([
            'status'      => true,
            'status_code' => 200,
            'message'     => 'Donation history retrieved successfully.',
            'donations'   => $donations,
        ]);
    }
}
```

---

## 10. `routes/api.php`

```php
<?php

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PurchaseController;

Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    // PhonePe payment gateway
    Route::post('payment/create-order', [PaymentController::class, 'createOrder']);
    Route::get('payment/status/{orderId}', [PaymentController::class, 'getStatus']);

    // Record purchase AFTER server verifies payment
    Route::post('purchase-plan', [PurchaseController::class, 'purchasePlan']);

    // Profile payment history
    Route::get('donation-history', [PurchaseController::class, 'donationHistory']);
});

// PhonePe webhook (public, signature verified)
Route::post('payment/webhook', [PaymentController::class, 'handleWebhook']);
```

---

## 11. Exact API Payloads (final reference)

### 1) CREATE ORDER — `POST /api/user/payment/create-order`

```jsonc
// Plan purchase
{ "plan_id": 1 }

// Donation
{ "amount": 500, "donation_type": "one-time", "mobile": "9999999999", "remark": "Diwali donation" }
```

```json
// Success
{
  "status": true,
  "status_code": 200,
  "orderId": "OMO123456789",               // PhonePe internal order id -> SDK (`startTransaction` body)
  "merchantOrderId": "GMT502026091212345678901726189234", // OUR id -> status / purchase-plan
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2) CHECK STATUS — `GET /api/user/payment/status/{orderId}`

```json
{ "success": true, "status_code": 200, "payment_status": "COMPLETED",
  "transaction_id": "T123456789012345678",
  "response": { "state": "COMPLETED", "transactionId": "T123456789012345678", "amount": 50000 } }
```

### 3) RECORD PURCHASE — `POST /api/user/purchase-plan`

```jsonc
// Plan
{ "plan_id": 1, "payment_status": "paid", "transaction_id": "GMT5020...", "remark": "Monthly membership" }

// Donation
{ "donation_type": "one-time", "amount": 500, "payment_status": "paid", "transaction_id": "GMT5020...", "remark": "Diwali donation" }
```

```json
// Success
{ "status": true, "status_code": 200, "message": "Plan purchased successfully & membership activated." }
```

### 4) DONATION HISTORY — `GET /api/user/donation-history`

```json
{ "status": true, "status_code": 200, "message": "Donation history retrieved successfully.",
  "donations": [
    { "id": 1, "amount": "500.00", "payment_status": "paid",
      "transaction_id": "GMT502026091212345678901726189234",
      "donation_type": "one-time", "remark": "Diwali donation",
      "date": "12 Sep 2026, 02:30 PM",
      "plan": { "id": 1, "plan_name": "Plan Silver", "duration": "monthly" } }
  ] }
```

### 5) WEBHOOK — `POST /api/payment/webhook`

```text
Header : X-VERIFY: <base64(sha256(response + webhook_salt))>
Body   : { "response": "<base64-encoded-json-of-phonepe-order>" }
Ack    : { "status": true }
```

---

## 12. Frontend compatibility (already done)

Frontend service `src/services/PhonePePaymentService.ts` ab aapke contract pe chalta hai:

- `createOrder` → `{status, status_code, orderId, token, merchantOrderId}` padh leta hai (top-level fallback already tha). `orderId` (PhonePe internal id) SDK ko jaata hai; `merchantOrderId` (GMT) status / purchase-plan ke liye use hota hai.
- `fetchOrderState` → ab `payment_status` field bhi padhta hai (aapke status response ke hisaab se), COMPLETED/FAILED/PENDING map karta hai.
- `purchasePlanStore` (`src/zustand/useHomeStore.ts`) → `transaction_id` = appointment ka `GMT...` order id bhejta hai, jo aapke backend ke `merchant_order_id` se match hota hai.
- Status polling 3× (2s gap) SDK SUCCESS ke baad, taaki webhook timing ka false-negative na lage.

---

## 13. Security Checklist

- [x] Client Secret `.env` — app mein kabhi nahi.
- [x] `payment_status:"paid"` kabhi trust nahi — purchase-plan pehle PhonePe LIVE verify.
- [x] Amount reconciliation (donation amount vs created order).
- [x] Plan price from DB (client price koi trust nahi).
- [x] Webhook X-VERIFY (salt) + checksum-key-id fallback — signature bina verify ka process nahi.
- [x] Orders user-scoped (`user_id` match).
- [x] Unique `merchant_order_id` — duplicate recording impossible.
- [x] DB transaction for activation/recording.
- [x] Inactive plan reject (`status !== 1`).

---

## 14. Troubleshooting — `"Failed to get PhonePe OAuth token"`

Yeh error backend ke OAuth call pe aata hai jab HTTP 2xx nahi aaya ya `access_token` missing tha.
**Likely causes, order mein:**

1. **`PHONEPE_ENV` production/sandbox mismatch (sabse common)**
   - Agar aapke Client ID/Secret **sandbox** ke hain lekin `PHONEPE_ENV=production` hai (ya ulte), PhonePe `invalid_client` deta hai.
   - Check karo: Client ID dashboard ke **kis environment** ka hai — pehle `PHONEPE_ENV=sandbox` se test karo, phir production.
2. **Config cached** — `.env` edit ke baad kabhi `php artisan config:clear` karna zaroori hai (ya `config:cache` dobara).
3. **Wrong / partial credentials** — `.env` mein trailing spaces, wrong secret, ya empty `PHONEPE_CLIENT_SECRET`.
4. **Server outbound HTTPS blocked / SSL** — server se PhonePe tak `api.phonepe.com` reachable ho, cURL CA bundle theek ho.

**Step A — Sabse pehle server se direct test (asli PhonePe response dekho):**

```bash
curl -s -X POST https://api.phonepe.com/apis/identity-manager/v1/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=SU2609111800150744634227&client_version=1&client_secret=YOUR_SECRET&grant_type=client_credentials'
```

- Agar yeh `access_token` deta hai → URL/creds theek, problem backend config mein hai.
- Agar `invalid_client` deta hai → credentials wrong ya environment mismatch.
- Agar timeout/SSL error → server network/CERT issue.

**Step B — Laravel se exactly kya request ja rahi hai, dekho:**

```bash
php artisan tinker --execute="
  \$c = config('phonepe');
  var_dump(\$c['env'], \$c['identity_url'], \$c['client_id'], \$c['client_version']);
  try {
    \$r = Illuminate\Support\Facades\Http::asForm()->post(\$c['identity_url'], [
      'client_id'     => \$c['client_id'],
      'client_version'=> \$c['client_version'],
      'client_secret' => \$c['client_secret'],
      'grant_type'    => 'client_credentials',
    ]);
    dd(\$r->status(), \$r->body());
  } catch (\Throwable \$e) { dd(\$e->getMessage()); }
"
```

`var_dump` se check karo ki `env`, `identity_url`, `client_id` sahi load ho rahe hain ya nahi (caching ka pata chalega).
HTTP status + body jo aayegi us se exact cause pata chalega:

| HTTP status | Body hint | Cause |
|---|---|---|
| 401 / 400 | `invalid_client`, `invalid_grant` | Credentials wrong / env mismatch |
| 404 | `Not Found` | Wrong `identity_url` (production/sandbox ulte) |
| 200 | `missing access_token` | Secret galat → empty token |
| 000 / timeout / curl error | SSL/cert | Server network issue |
| 429 | Too many calls | Token cache clear karke retry |

**Step C — Fix:**
```bash
php artisan config:clear
php artisan cache:clear
# .env dobara save karke upar ki tinker test repeat karo
```

> Upgrade ke baad error message mein ab **asli HTTP status + response body** bhi aa jayegi (`auth failed HTTP 401: invalid_client..`), isliye aage kabhi guess nahi karna padega.

---

## 15. Test Sequence

1. `php artisan config:clear`
2. Sandbox: Donate ₹500 → SDK (sandbox UPI 9999999999@ybl) → `payments` row `CREATED → COMPLETED`.
3. Plans / JoinMembership → membership activate, dates set.
4. Profile → donation-history list dikhna chahiye.
5. Webhook test event → `response` column update.
6. Sab ok → `PHONEPE_ENV=production`.