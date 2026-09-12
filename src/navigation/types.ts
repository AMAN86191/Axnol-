export type RootStackParamList = {
  // Auth
  SplashScreen: undefined;
  LoginScreen: undefined;
  SignUpScreen: undefined;
  ForgotPasswordScreen: undefined;
  OtpVerificationScreen: {
    email?: string;
    phoneNumber?: string;
    mode?: 'login' | 'signup';
    signupData?: {
      name: string;
      email: string;
      dob: string;
      bio: string;
      refer_by: string;
    };
  };
  MainDrawer: undefined;
  JoinMembershipScreen: undefined;
  DonateScreen: undefined;
  HelpSupportScreen: undefined;
  MembershipCertificateScreen: undefined;
  EditPostScreen: { postId: string };
  PostDetailsScreen: { postId: string };
  ReferralScreen: undefined;
  GalleryScreen: undefined;
  EventGalleryScreen: { eventId: string };
  PrivacyPolicyScreen: undefined;
  TermsScreen: undefined;
  PublicProfileScreen: { userId: string };
  NotificationScreen: undefined;
  AboutTrustScreen: undefined;
  CommunityMembersScreen: undefined;
  FeedScreen: undefined;
  DonationSuccessScreen: { amount: number; transactionId: string; date: string };
  PlansScreen: undefined;
  EditProfileScreen: undefined;
  UpcomingEventsScreen: undefined;
};
