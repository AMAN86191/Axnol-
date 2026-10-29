export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS_CONTENT: LegalContent = {
  title: 'Terms & Conditions',
  updated: 'Last updated: 29 October 2026',
  intro:
    'These Terms & Conditions ("Terms") govern your access to and use of the Axnol mobile application (the "App"), our website at https://axnol.in, and related services (together, the "Services") provided by Axnol Lubetech India Pvt. Ltd. ("Axnol", "we", "us", "our"), having its registered office at Shanti Niketan - Kh 65, Ground Floor, Bhawaninagar, Murlipura-302039, Jaipur, Rajasthan, India. By creating an account or using the Services, you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the Services.',
  sections: [
    {
      title: 'Acceptance of Terms',
      body: 'By accessing or using the Services, you confirm that you have read, understood and agreed to these Terms and our Privacy Policy. If you do not agree with any part of these Terms, you must not use the Services. Continued use of the Services after any changes to these Terms constitutes your acceptance of the revised Terms.',
    },
    {
      title: 'Eligibility and Account',
      body: 'You must be at least 18 years old and competent to enter into a binding contract to use the Services. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to provide accurate, complete and current information during registration and to keep it updated. Notify us immediately of any unauthorised use of your account. You may delete your account at any time from the Profile section of the App or through https://axnol.in/account-deletion.html. Account deletion is processed immediately after you confirm the request, except for order, invoice and transaction records that we are required to retain by law.',
    },
    {
      title: 'Use of the Services',
      body: 'You agree to use the Services only for lawful purposes. You must not: (a) use the Services for any unlawful, fraudulent or misleading purpose; (b) attempt to gain unauthorised access to any part of the Services, servers or systems; (c) interfere with or disrupt the Services, servers or networks; (d) reverse engineer, decompile or attempt to extract the source code of the App; (e) misrepresent your identity, business or affiliation; (f) upload or transmit any malicious code, virus or harmful material; or (g) use the Services in a way that infringes the rights of Axnol or any third party.',
    },
    {
      title: 'Products and Information',
      body: 'Product descriptions, specifications, datasheets and images are provided for general information. We make reasonable efforts to keep them accurate, but they may change without notice. You are responsible for confirming that a product is suitable for your intended use and for following the applicable safety data sheet, handling instructions and applicable law. Please confirm technical specifications with us before placing an order.',
    },
    {
      title: 'Orders and Order Acceptance',
      body: 'Placing an order through the Services constitutes an offer to purchase. An order is accepted only when we issue an order confirmation or invoice. We may refuse or cancel an order where there is a pricing error, stock unavailability, inaccurate delivery information, suspected fraud or a legal or regulatory restriction. We will inform you of any cancellation and, where applicable, process a refund.',
    },
    {
      title: 'Prices, Taxes and Payment',
      body: 'Prices, taxes, delivery charges and payment terms are as stated at the time of order or as agreed in writing between Axnol and the customer or channel partner. Prices may change without notice before an order is accepted. The App currently does not provide an online payment gateway and does not store card, UPI or banking credentials. Payments may be made through the modes specified on the invoice or order confirmation, and you agree to pay all charges incurred by your account.',
    },
    {
      title: 'Shipping, Delivery and Risk',
      body: 'Estimated delivery dates are indicative and not guaranteed. Risk of loss and title for products pass to you upon delivery to the carrier or as otherwise agreed in writing. Delays caused by force majeure, carrier disruptions, weather, strikes or inaccurate delivery information are beyond our reasonable control, and we shall not be liable for such delays.',
    },
    {
      title: 'Cancellations, Returns and Refunds',
      body: 'Order cancellations, returns and refunds are governed by our return and replacement policy applicable to the products purchased. Because many products are industrial lubricants and chemicals, opened or used products may not be eligible for return unless they are defective or damaged on arrival. Please inspect products on delivery and report visible damage promptly. Approved refunds will be processed to the original payment method or, where payment was made offline, by bank transfer within a reasonable period.',
    },
    {
      title: 'Intellectual Property',
      body: 'All content on the Services, including the AXNOL name, logos, product names, text, graphics, designs, documents and software, is owned by or licensed to Axnol and is protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Services for their intended purpose only. You may not copy, modify, distribute or use any content commercially without our prior written consent.',
    },
    {
      title: 'Third-Party Links and Services',
      body: 'The Services may contain links to third-party websites, applications or services that we do not control. We are not responsible for their content, availability, security or privacy practices. Your use of a third-party service is governed by the terms and privacy policy of that third party.',
    },
    {
      title: 'Privacy',
      body: 'Your use of the Services is also governed by our Privacy Policy, available in the App and at https://axnol.in/privacy-policy.html. The Privacy Policy explains how we collect, use, share, retain and protect personal information, and how you can exercise your rights.',
    },
    {
      title: 'App Stores',
      body: 'If you download the App from Google Play, the Apple App Store or another app store, you acknowledge that these Terms are between you and Axnol only, and not with the app store. The app store is not responsible for the App, its maintenance, support or any claims relating to it. You must also comply with the terms and policies of the app store.',
    },
    {
      title: 'Suspension and Termination',
      body: 'We may suspend or terminate your access to the Services at any time, with or without cause and with or without notice, including for breach of these Terms, suspected fraud, misuse or where required by law. You may stop using the Services and delete your account at any time. Upon termination, your right to use the Services will immediately cease, and any outstanding obligations will survive termination where applicable.',
    },
    {
      title: 'Disclaimers',
      body: 'The Services are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose and non-infringement. We do not warrant that the Services will be uninterrupted, error-free or free of harmful components, or that product information is complete or accurate in all respects. Nothing in these Terms excludes any warranty or liability that cannot be excluded under applicable law.',
    },
    {
      title: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, Axnol shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits, data or goodwill, arising out of or in connection with your use of the Services. Our aggregate liability for any claim arising out of these Terms shall not exceed the amount paid by you to us for the product or service giving rise to the claim in the twelve (12) months preceding the event giving rise to the claim.',
    },
    {
      title: 'Indemnity',
      body: 'You agree to indemnify, defend and hold harmless Axnol, its directors, employees, agents and partners from and against any claims, liabilities, damages, losses and expenses (including reasonable legal fees) arising out of your misuse of the Services, your violation of these Terms, or your violation of any rights of a third party.',
    },
    {
      title: 'Changes to These Terms',
      body: 'We may update these Terms from time to time. The revised version will be posted on this page with a new Last updated date. Where changes are significant, we will provide additional notice through the App or by other reasonable means. Continued use of the Services after the changes take effect means you accept the revised Terms.',
    },
    {
      title: 'Governing Law and Jurisdiction',
      body: 'These Terms are governed by and construed in accordance with the laws of India. The courts at Jaipur, Rajasthan shall have exclusive jurisdiction over any dispute arising out of or in connection with these Terms, subject to any mandatory rights available to you under applicable law.',
    },
    {
      title: 'Contact',
      body: 'Questions about these Terms can be sent to Axnol Lubetech India Pvt. Ltd., Shanti Niketan - Kh 65, Ground Floor, Bhawaninagar, Murlipura-302039, Jaipur, Rajasthan, India. Email: contact@axnol.in. Phone: +91 94390 98999. Website: https://axnol.in.',
    },
  ],
};

export const PRIVACY_CONTENT: LegalContent = {
  title: 'Privacy Policy',
  updated: 'Last updated: 29 October 2026',
  intro:
    'This Privacy Policy explains how Axnol Lubetech India Pvt. Ltd. ("Axnol", "we", "us", "our") collects, uses, stores, shares and protects personal information when you use the Axnol mobile application (the "App"), our website at https://axnol.in, and related services (together, the "Services"). It applies to information collected through the App and website, including information you submit to us. We handle personal information in accordance with applicable laws in India.',
  sections: [
    {
      title: 'Who We Are',
      body: 'Axnol Lubetech India Pvt. Ltd. is the entity responsible for the personal information described in this policy. Our registered office is Shanti Niketan - Kh 65, Ground Floor, Bhawaninagar, Murlipura-302039, Jaipur, Rajasthan, India. For privacy questions, contact us at contact@axnol.in or +91 94390 98999.',
    },
    {
      title: 'Scope of This Policy',
      body: 'This policy applies to account holders, website visitors, channel partners, job applicants and anyone who contacts us through the Services. It does not apply to third-party websites, applications or services that we do not control. We encourage you to read the privacy policy of every third-party service you use.',
    },
    {
      title: 'Information We Collect',
      body: '(a) Account and business information: name, email address, mobile number, company name, optional GST number, billing and delivery address, city, state, pincode, profile photo and login credentials. Passwords are sent over HTTPS for authentication and are not stored in local app storage. (b) Order and transaction information: products ordered, quantity, rate, pack size, order and invoice details, payment status, purchase history, delivery address, contact number and order remarks. (c) Device and app information: device and operating system details, app version, network connection information, IP address recorded by our services, push notification token from Google Firebase Cloud Messaging, and technical or security logs generated when you use the Services. (d) Website and communications: information you submit through contact, career, channel-partner or enquiry forms; feedback, complaints and support requests; and browser and cookie information processed when you use the website. (e) Information stored on your device: login token, basic profile details, cart and wishlist items, notification token, cached app data and invoice PDF files that you choose to download or share. (f) Profile photo: only when you choose one from your photo library and submit it. We do not request access to your contacts, SMS messages, call logs or precise location. The current version of the App does not use your camera.',
    },
    {
      title: 'Device Permissions We Use',
      body: 'The App may ask for Internet access to connect to our servers and load products, prices, orders and account information; photo library access to allow you to choose a profile photo; notification permission to send order updates, account updates, invoice notifications and service messages; and storage or file access to save or open invoice PDF files. On older Android versions, the App may ask for storage permission to save invoices to Downloads. You can change these permissions at any time in your device settings. If you disable a permission, some features may not work.',
    },
    {
      title: 'How We Use Your Information',
      body: 'We use personal information to create, verify and manage your account, including email verification through OTP; process, confirm, fulfil and deliver your orders and maintain your purchase history; prepare invoices and record payment status; communicate with you about orders, invoices, account status and service updates; provide customer support and respond to enquiries, complaints and feedback; prevent fraud, misuse and security incidents and protect our users and Services; maintain, troubleshoot and improve the App, website, products and Services; process job applications and channel-partner requests; comply with legal, tax, accounting and regulatory obligations; and send promotional communications only where permitted by law and with an option to opt out. The current version of the App does not process online payments and does not store card, UPI or banking credentials.',
    },
    {
      title: 'Consent and Legal Basis',
      body: 'We process personal information on the basis of your consent, the performance of our contract with you, compliance with legal obligations, and legitimate uses permitted under applicable law. You give consent when you register, accept this policy, upload a profile photo or enable notifications. You may withdraw your consent at any time by contacting us. Withdrawal will not affect processing that has already taken place and may prevent us from providing some or all of the Services.',
    },
    {
      title: 'Sharing and Third-Party Services',
      body: 'We do not sell your personal information and do not use it for third-party behavioural advertising. We may share information with: cloud hosting, server and API providers that operate our backend and store account, order and invoice data; email and OTP delivery providers that send verification codes and service emails; Google Firebase Cloud Messaging to deliver push notifications and process device push tokens; logistics, delivery and channel partners where needed to fulfil your order or request; professional advisers, auditors and government authorities where required by law; and a successor entity in connection with a merger, acquisition or transfer of assets. The App does not currently offer online payments. Service providers may process information only to provide their services to us and are expected to protect it with appropriate safeguards.',
    },
    {
      title: 'Cookies and Local Storage',
      body: 'Our website may use cookies needed for site features. We do not use website cookies for third-party behavioural advertising. The App uses local storage on your device to keep you signed in, remember your cart and wishlist, store notification tokens, cache data and support invoice downloads. You can control or clear cookies in your browser settings and clear app data through your device settings. Some features may not work properly if you do so.',
    },
    {
      title: 'Data Retention',
      body: 'Account and profile information is kept while your account is active. When you delete your account, your profile and personal account data are permanently deleted immediately after the deletion request is confirmed or verified. Order, invoice, payment and transaction records may be retained for longer where required by tax, accounting, legal or regulatory requirements; these records are protected and access is restricted. Server logs and security information are retained for a limited period as needed for security, troubleshooting and legal compliance, generally not exceeding 12 months unless required for an investigation. Career application information is retained only for the recruitment process and for a reasonable period thereafter, unless required by law. Support communications may be retained for as long as needed to resolve the matter and meet legal obligations. Deleted account profile data cannot be recovered.',
    },
    {
      title: 'Account Deletion',
      body: 'You can delete your account directly in the App by logging in, opening your Profile, tapping Delete Account and confirming the deletion request. To request deletion without using the App, visit https://axnol.in/account-deletion.html or email contact@axnol.in from the email address associated with your account. Do not send your password. After your request is verified, your account is deleted immediately and your access token stops working. Your personal profile data is permanently removed at that time, except order, invoice and transaction records that we are required to retain by law. Deleted accounts cannot be restored, and you will need to register again to use the App in the future.',
    },
    {
      title: 'Security',
      body: 'We use reasonable technical and organisational measures to protect personal information, including encryption in transit using HTTPS, token-based authentication, access controls, restricted access to personal data, secure server-side handling of passwords, and monitoring and security checks. No method of transmission over the internet or electronic storage is completely secure, so we cannot guarantee absolute security. Please keep your login details confidential and inform us immediately if you believe your account has been accessed without permission.',
    },
    {
      title: 'Your Rights and Grievance Redressal',
      body: 'Subject to applicable law, you may request access to your personal information; request correction or updating of inaccurate information; request deletion of your personal information; withdraw consent for processing; nominate a person to exercise your rights in the event of death or incapacity; and raise a grievance about how we handle your data. You can update some information directly in the Profile section of the App. For other requests, contact our Grievance Officer at contact@axnol.in or +91 94390 98999. We will acknowledge and address grievances within 30 days or within the period required by applicable law. You may also raise a complaint with the Data Protection Board of India.',
    },
    {
      title: 'International Transfers',
      body: 'Some of our service providers, including cloud hosting and Google Firebase, may process information outside India. Where personal information is transferred outside India, we take reasonable steps and use contractual or other safeguards to protect it in accordance with applicable law.',
    },
    {
      title: "Children's Privacy",
      body: 'The Services are intended for businesses and individuals who are at least 18 years old. We do not knowingly collect personal information from children. If you believe that a child has provided personal information, contact us and we will delete it.',
    },
    {
      title: 'Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. The revised version will be posted in the App and on our website with a new Last updated date. Where changes are significant, we will provide additional notice through the App or by other reasonable means. Your continued use of the Services after the changes take effect means you accept the revised policy.',
    },
    {
      title: 'Contact Us',
      body: 'For questions, requests or complaints about this Privacy Policy or our data practices, contact Axnol Lubetech India Pvt. Ltd., Shanti Niketan - Kh 65, Ground Floor, Bhawaninagar, Murlipura-302039, Jaipur, Rajasthan, India. Email: contact@axnol.in. Phone: +91 94390 98999. Website: https://axnol.in.',
    },
  ],
};
