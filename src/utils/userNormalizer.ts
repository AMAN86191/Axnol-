import { toAbsoluteImageUrl } from './profileFormData';

/**
 * The backend returns THREE different shapes for the same user and they do not
 * agree on where a field lives:
 *
 *  1. `GET user/get-profile` / `user/public-profile/{id}`  ("rich" shape)
 *     data.user     -> id, uid, name, email, phone, status, start_date, end_date,
 *                      membership, no_of_refer, refer_by, uploaded_by, fcm_token
 *     data.profile  -> dob, dom, profession, bio, country, city, state, pincode,
 *                      address, profile_pic, certificate, referral_code,
 *                      membership, join_date
 *     (NOTE: no partner_name, no area)
 *
 *  2. `GET user/members`  ("raw" shape)
 *     user          -> ..., partner_name, ...
 *     user.user_profile -> dob, dom, profession, city, pincode, area, state,
 *                      address, country, profile_pic, ...
 *
 *  3. `user/register` / `user/verify-otp`  ("raw" shape, same as 2)
 *
 * So `partner_name` lives on the `users` table and `area` lives on the `profiles`
 * table, but `get-profile` returns neither. Reading `user.profile.partner_name`
 * or `user.profile.area` after a `get-profile` call always yields undefined,
 * which is why those two form fields always prefill empty.
 *
 * This normalizer folds every known source into a single canonical `user.profile`
 * so the rest of the app can just read `user.profile.<field>`.
 */

export const PROFILE_FIELDS = [
  'dob',
  'dom',
  'partner_name',
  'profession',
  'bio',
  'country',
  'city',
  'state',
  'pincode',
  'address',
  'area',
  'certificate',
  'referral_code',
  'membership',
  'join_date',
  'profile_pic',
] as const;

const isUsable = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

export const normalizeUser = (input: any): any => {
  if (!input || typeof input !== 'object') return input;

  // get-profile / public-profile return a { user, profile, statistics } wrapper,
  // whereas verify-otp / members return the user object itself. Accept both.
  const isWrapper = !!input.user && typeof input.user === 'object';
  const raw = isWrapper ? { ...input.user } : { ...input };

  if (isWrapper && input.profile) {
    raw.profile = { ...(raw.profile || {}), ...input.profile };
  }

  // Ordered by freshness: the rich `profile` from get-profile wins, then the
  // raw `user_profile` relation, then top-level user columns.
  const sources: any[] = [
    raw.profile,
    raw.user_profile,
    raw.user?.profile,
    raw.user?.user_profile,
    raw,
  ];

  const profile: Record<string, any> = { ...(raw.profile || {}) };

  PROFILE_FIELDS.forEach(field => {
    for (const source of sources) {
      if (source && isUsable(source[field])) {
        profile[field] = source[field];
        return;
      }
    }
    if (!(field in profile)) profile[field] = null;
  });

  const picture = profile.profile_pic || raw.profile_pic || raw.avatar || null;
  profile.profile_pic = picture ? toAbsoluteImageUrl(picture) : '';

  const result: Record<string, any> = {
    ...raw,
    profile,
    // Keep the alias in sync so screens that read `user.user_profile.*` (and the
    // debug output) no longer show a stale all-null object next to the real one.
    user_profile: profile,
  };

  if (isWrapper) {
    if (input.statistics) result.statistics = input.statistics;
    if (input.referred_users) result.referred_users = input.referred_users;
  }

  return result;
};
