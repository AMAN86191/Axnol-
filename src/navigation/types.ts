import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: NavigatorScreenParams<CatalogueStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Industry: NavigatorScreenParams<CatalogueStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type CatalogueStackParamList = {
  Products:
    | {
        categoryId?: string;
        subCategoryId?: string;
        industryId?: string;
        title?: string;
        featured?: boolean;
        search?: string;
      }
    | undefined;
  ProductDetails: {productId: string};
  Industries: undefined;
  Categories: {industryId: string; industryName: string};
  SubCategories: {categoryId: string; categoryName: string; industryId: string};
  RequestPrice: {productId?: string; productName?: string; productImage?: string; category?: string} | undefined;
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: {orderId: string};
  Invoice: {orderId?: string; invoiceId?: string} | undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  PricingRequests: undefined;
  Documents: undefined;
  MyEnquiries: undefined;
  ContactUs: undefined;
};

export type MainDrawerParamList = {
  HomeTabs: NavigatorScreenParams<MainTabParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainDrawerParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
export type {RootStackParamList as RootParamList};
