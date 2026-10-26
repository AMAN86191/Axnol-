import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ProfileSetup: undefined;
  ForgotPassword: undefined;
  TermsConditions: undefined;
  PrivacyPolicy: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
  ProductDetails: {productId: string};
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
  SubCategories: {
    categoryId: string;
    categoryName: string;
    industryId?: string;
  };
  CategoryProducts: {
    categoryId?: string;
    subCategoryId?: string;
    industryId?: string;
    title?: string;
  };
  RequestPrice:
    | {
        productId?: string;
        productName?: string;
        productImage?: string;
        rateChartId?: string | number;
        category?: string;
        price?: number;
        mrp?: number;
        unit?: string;
        quantity?: number;
        packSizes?: string[];
      }
    | undefined;
  Industries: undefined;
  IndustryDetails: {industryId: string; industryTitle?: string};
  Categories: {industryId?: string; industryName?: string} | undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
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
  IndustryDetails: {industryId: string; industryTitle?: string};
  Categories: {industryId?: string; industryName?: string} | undefined;
  SubCategories: {
    categoryId: string;
    categoryName: string;
    industryId?: string;
  };
  CategoryProducts: {
    categoryId?: string;
    subCategoryId?: string;
    industryId?: string;
    title?: string;
  };
  RequestPrice:
    | {
        productId?: string;
        productName?: string;
        productImage?: string;
        rateChartId?: string | number;
        category?: string;
        price?: number;
        mrp?: number;
        unit?: string;
        quantity?: number;
        packSizes?: string[];
      }
    | undefined;
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
  About: undefined;
};

export type MainDrawerParamList = {
  HomeTabs: NavigatorScreenParams<MainTabParamList>;
};

export type MainStackParamList = {
  Drawer: NavigatorScreenParams<MainDrawerParamList>;
  Cart: undefined;
  Wishlist: undefined;
  ProductDetails: HomeStackParamList['ProductDetails'];
  RequestPrice: HomeStackParamList['RequestPrice'];
  ContactUs: undefined;
  About: undefined;
  TermsConditions: undefined;
  PrivacyPolicy: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
export type {RootStackParamList as RootParamList};
