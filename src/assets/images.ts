/**
 * Local image registry. Keys are used in mock data and resolved by AppImage.
 */
import type {ImageSourcePropType} from 'react-native';

const images = {
  logo: require('../assets/logo_blue.png'),
  user_avatar: require('../../assets/axnol/rahul_avatar.png'),
  product_drum: require('../../assets/axnol/mock_drum.png'),
  hero_banner: require('../../assets/axnol/hero_banner.png'),
  header_sky_bg: require('../../assets/axnol/header_sky_bg.png'),
  cat_engine_oil: require('../../assets/axnol/cat_engine_oil.png'),
  cat_gear_oil: require('../../assets/axnol/cat_gear_oil.png'),
  cat_hydraulic_oil: require('../../assets/axnol/cat_hydraulic_oil.png'),
  cat_industrial: require('../../assets/axnol/cat_industrial.png'),
  cat_marine: require('../../assets/axnol/cat_marine.png'),
  cat_automotive: require('../../assets/axnol/cat_automotive.png'),
  register_corner_bg: require('../../assets/axnol/register_corner_bg.png'),

  // Auth AI assets
  auth_hero_oil: require('../../assets/axnol/auth_hero_oil.png'),
  auth_onboard_tech: require('../../assets/axnol/auth_onboard_tech.png'),
  auth_dealer_badge: require('../../assets/axnol/auth_dealer_badge.png'),
  auth_splash_bg: require('../../assets/axnol/auth_splash_bg.png'),

  // Auth AI background assets
  auth_splash_bg_ai: require('../../assets/axnol/auth_splash_bg_ai.jpg'),
  auth_welcome_bg_ai: require('../../assets/axnol/auth_welcome_bg_ai.jpg'),
  onboarding_apps_ai: require('../../assets/axnol/onboarding_apps_ai.jpg'),
  onboarding_barrel_ai: require('../../assets/axnol/onboarding_barrel_ai.jpg'),

  // Onboarding
  onboarding_1: require('../../assets/axnol/onboarding_1.png'),
  onboarding_2: require('../../assets/axnol/onboarding_2.png'),
  onboarding_3: require('../../assets/axnol/onboarding_3.png'),

  // Home banners
  banner_1: require('../../assets/axnol/banner_1.png'),
  banner_2: require('../../assets/axnol/banner_2.png'),
  banner_3: require('../../assets/axnol/banner_3.png'),
  banner_4: require('../../assets/axnol/banner_4.png'),
  banner_5: require('../../assets/axnol/banner_5.png'),
  banner_6: require('../../assets/axnol/banner_6.png'),

  // Industries 1..15
  industry_1: require('../../assets/axnol/industry_1.png'),
  industry_2: require('../../assets/axnol/industry_2.png'),
  industry_3: require('../../assets/axnol/industry_3.png'),
  industry_4: require('../../assets/axnol/industry_4.png'),
  industry_5: require('../../assets/axnol/industry_5.png'),
  industry_6: require('../../assets/axnol/industry_6.png'),
  industry_7: require('../../assets/axnol/industry_7.png'),
  industry_8: require('../../assets/axnol/industry_8.png'),
  industry_9: require('../../assets/axnol/industry_9.png'),
  industry_10: require('../../assets/axnol/industry_10.png'),
  industry_11: require('../../assets/axnol/industry_11.png'),
  industry_12: require('../../assets/axnol/industry_12.png'),
  industry_13: require('../../assets/axnol/industry_13.png'),
  industry_14: require('../../assets/axnol/industry_14.png'),
  industry_15: require('../../assets/axnol/industry_15.png'),

  // Categories 1..10
  category_1: require('../../assets/axnol/category_1.png'),
  category_2: require('../../assets/axnol/category_2.png'),
  category_3: require('../../assets/axnol/category_3.png'),
  category_4: require('../../assets/axnol/category_4.png'),
  category_5: require('../../assets/axnol/category_5.png'),
  category_6: require('../../assets/axnol/category_6.png'),
  category_7: require('../../assets/axnol/category_7.png'),
  category_8: require('../../assets/axnol/category_8.png'),
  category_9: require('../../assets/axnol/category_9.png'),
  category_10: require('../../assets/axnol/category_10.png'),

  // Products
  product_oil: require('../../assets/axnol/product_oil.png'),
  product_grease: require('../../assets/axnol/product_grease.png'),
  product_forge: require('../../assets/axnol/product_forge.png'),
  product_cutting: require('../../assets/axnol/product_cutting.png'),
  product_food: require('../../assets/axnol/product_food.png'),
  product_generic: require('../../assets/axnol/product_generic.png'),
  product_baseoil: require('../../assets/axnol/product_baseoil.png'),
  product_chem: require('../../assets/axnol/product_chem.png'),
  product_mro: require('../../assets/axnol/product_mro.png'),
  product_punch: require('../../assets/axnol/product_punch.png'),
  product_wax: require('../../assets/axnol/product_wax.png'),
} as const;

export type ImageKey = keyof typeof images;

export const resolveImage = (
  key?: string | null,
): ImageSourcePropType | undefined =>
  (images as Record<string, ImageSourcePropType | undefined>)[key ?? ''];

export default images;
