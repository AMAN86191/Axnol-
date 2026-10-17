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
  updated: 'Last updated: 16 October 2026',
  intro:
    'Welcome to Axnol. These Terms & Conditions govern your access to and use of the Axnol mobile application, website and related services (collectively, the "Service") operated by Axnol ("we", "us", "our"). By creating an account or using the Service, you agree to be bound by these Terms.',
  sections: [
    {
      title: 'Acceptance of Terms',
      body: 'By accessing or using the Service, you confirm that you have read, understood and agreed to these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these Terms, you must not use the Service. Continued use of the Service after any changes to the Terms constitutes your acceptance of the revised Terms.',
    },
    {
      title: 'Eligibility & Account',
      body: 'You must be at least 18 years old and competent to enter into a binding contract to use the Service. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to provide accurate, complete and current information during registration and to keep it updated. Notify us immediately of any unauthorised use of your account.',
    },
    {
      title: 'Products, Pricing & Orders',
      body: 'All product descriptions, specifications, images and pricing are provided for general information and are subject to change without notice. Placing an order through the Service constitutes an offer to purchase; an order is accepted only when we issue an order confirmation or invoice. We reserve the right to refuse or cancel any order at our sole discretion, including in cases of pricing errors, stock unavailability or suspected fraud.',
    },
    {
      title: 'Payments & Invoicing',
      body: 'Prices are displayed inclusive or exclusive of applicable taxes as stated at the time of order. Payment terms, modes of payment and currency will be specified on the invoice or order confirmation. You agree to pay all charges incurred by your account. Invoices are generated electronically and made available within the app under Orders.',
    },
    {
      title: 'Shipping & Delivery',
      body: 'Estimated delivery dates are indicative and not guaranteed. Risk of loss and title for products pass to you upon delivery to the carrier. Delays caused by force majeure, carrier disruptions or inaccurate delivery information are beyond our reasonable control, and we shall not be liable for such delays.',
    },
    {
      title: 'Cancellations, Returns & Refunds',
      body: 'Order cancellations, returns and refunds are governed by our return and replacement policy applicable to the products purchased. Because many products are industrial lubricants and chemicals, opened or used products may not be eligible for return unless they are defective or damaged on arrival. Any refund will be processed to the original payment method within a reasonable period after the return is approved.',
    },
    {
      title: 'Acceptable Use',
      body: 'You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorised access to any part of the Service or its systems; (c) interfere with or disrupt the Service, servers or networks; (d) reverse engineer, decompile or otherwise attempt to extract source code; (e) misrepresent your identity or affiliation; or (f) upload or transmit any malicious code. We may suspend or terminate your access for any violation of these Terms.',
    },
    {
      title: 'Intellectual Property',
      body: 'All content, trademarks, logos, product names, designs, text, graphics and software made available through the Service are the property of Axnol or its licensors and are protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for its intended purpose only. No licence is granted to use any trademark or brand element without our prior written consent.',
    },
    {
      title: 'Disclaimer of Warranties',
      body: 'The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose and non-infringement. We do not warrant that the Service will be uninterrupted, error-free or free of harmful components, or that product information is complete or accurate in all respects.',
    },
    {
      title: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, Axnol shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits, data or goodwill, arising out of or in connection with your use of the Service. Our aggregate liability for any claim arising out of these Terms shall not exceed the amount paid by you to us for the Service in the twelve (12) months preceding the event giving rise to the claim.',
    },
    {
      title: 'Indemnity',
      body: 'You agree to indemnify, defend and hold harmless Axnol, its directors, employees, agents and partners from and against any claims, liabilities, damages, losses and expenses (including reasonable legal fees) arising out of your misuse of the Service, your violation of these Terms, or your violation of any rights of a third party.',
    },
    {
      title: 'Termination',
      body: 'We may suspend or terminate your access to the Service at any time, with or without cause and with or without notice, including for breach of these Terms. Upon termination, your right to use the Service will immediately cease, and any outstanding obligations will survive termination where applicable.',
    },
    {
      title: 'Changes to These Terms',
      body: 'We reserve the right to modify these Terms at any time. Material changes will be notified through the Service, app notification or by other reasonable means. Your continued use of the Service after the effective date of changes constitutes your acceptance of the modified Terms.',
    },
    {
      title: 'Governing Law & Contact',
      body: 'These Terms shall be governed by and construed in accordance with the laws of India, and the courts having jurisdiction over our registered place of business shall have exclusive jurisdiction over any dispute arising out of these Terms. If you have any questions about these Terms & Conditions, please contact us through the Help & Support section of the app.',
    },
  ],
};

export const PRIVACY_CONTENT: LegalContent = {
  title: 'Privacy Policy',
  updated: 'Last updated: 16 October 2026',
  intro:
    'This Privacy Policy explains how Axnol ("we", "us", "our") collects, uses, shares and protects your personal information when you use the Axnol mobile application and related services (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.',
  sections: [
    {
      title: 'Information We Collect',
      body: 'We may collect the following types of information: (a) Account information such as your name, email address, phone number, business name, billing and shipping addresses; (b) Transaction information including orders, invoices, payment status and purchase history; (c) Device and technical information such as device model, operating system, app version, IP address, device identifiers and log data; and (d) Communications you send to us, including support enquiries and feedback.',
    },
    {
      title: 'How We Use Your Information',
      body: 'We use your information to: create and manage your account; process and fulfil orders and generate invoices; communicate with you about orders, updates and security alerts; provide customer support; improve the Service, features and user experience; comply with legal obligations; detect, prevent and address fraud, abuse or security issues; and send marketing communications where you have consented, which you may opt out of at any time.',
    },
    {
      title: 'Sharing & Disclosure',
      body: 'We do not sell your personal information. We may share your information with: service providers who assist us in operating the Service (such as hosting, analytics, payment and delivery partners) under appropriate confidentiality obligations; professional advisers where required by law; law enforcement or government authorities where required to comply with a legal process; and in connection with a merger, acquisition or sale of assets, in which case we will notify you before your information becomes subject to a different policy.',
    },
    {
      title: 'Data Security',
      body: 'We implement reasonable technical and organisational measures to protect your personal information from unauthorised access, alteration, disclosure or destruction, including encryption in transit, access controls and secure storage. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      title: 'Data Retention',
      body: 'We retain your personal information for as long as your account is active and as needed to provide the Service, and thereafter only for as long as necessary to fulfil the purposes described in this policy, comply with legal obligations, resolve disputes and enforce our agreements. When information is no longer required, it is deleted or anonymised.',
    },
    {
      title: 'Your Rights',
      body: 'Depending on your jurisdiction, you may have the right to access, correct, update or delete your personal information, to object to or restrict certain processing, to withdraw consent, and to data portability. You can review and update much of your information directly in the Profile section of the app. To exercise other rights, please contact us using the details below. We will respond to your request within a reasonable period.',
    },
    {
      title: 'Location & Device Information',
      body: 'We may collect and use location or device information to provide region-appropriate content, delivery options and security features. You can disable location access at any time through your device settings, although some features may then be unavailable or limited in functionality.',
    },
    {
      title: 'Cookies & Similar Technologies',
      body: 'The Service may use cookies, local storage, pixels and similar technologies to remember your preferences, keep you signed in and understand how the Service is used. You can control cookies through your device or browser settings, though disabling them may affect certain functionalities of the Service.',
    },
    {
      title: 'Third-Party Links & Services',
      body: 'The Service may contain links to third-party websites or services that are not operated by us. We are not responsible for the content, privacy policies or practices of any third-party services. We encourage you to review the privacy policy of every service you interact with.',
    },
    {
      title: "Children's Privacy",
      body: 'The Service is not directed to individuals under the age of 18, and we do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without verification of parental consent, we will take steps to delete that information promptly.',
    },
    {
      title: 'Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. We will post the updated policy within the Service and revise the "Last updated" date. Where changes are significant, we will provide additional notice through the app or by other reasonable means. Your continued use of the Service after the changes become effective constitutes your acceptance of the revised policy.',
    },
    {
      title: 'Contact Us',
      body: 'If you have any questions, concerns or requests regarding this Privacy Policy or our data practices, please reach out to us through the Help & Support section of the app or via the contact details provided on our official website. We will make every effort to address your concerns in a timely manner.',
    },
  ],
};
