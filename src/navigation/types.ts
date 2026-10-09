import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerify: {userId: string; email: string; demoOtp?: string};
  ApprovalPending: {userId?: string; email?: string};
  ProfileSetup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Catalogue: NavigatorScreenParams<CatalogueStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Notifications: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type CatalogueStackParamList = {
  Industries: undefined;
  Categories: {industryId: string; industryName: string};
  SubCategories: {categoryId: string; categoryName: string; industryId: string};
  Products: {
    categoryId?: string;
    subCategoryId?: string;
    industryId?: string;
    title: string;
    featured?: boolean;
    search?: string;
  };
  ProductDetails: {productId: string};
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: {orderId: string};
  Invoice: {orderId: string; invoiceId?: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  PricingRequests: undefined;
  Documents: undefined;
  MyEnquiries: undefined;
  ContactUs: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
export type {RootStackParamList as RootParamList};
