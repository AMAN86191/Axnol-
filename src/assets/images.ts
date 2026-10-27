/**
 * Local image registry resolved by AppImage.
 */
import type {ImageSourcePropType} from 'react-native';

const images = {
  user_avatar: require('../../assets/axnol/default_avatar.webp'),
  register_corner_bg: require('../../assets/axnol/register_corner_bg.webp'),

  // New Home Screen Assets
  ind_automotive: require('../../assets/axnol/ind_automotive.webp'),
  ind_industrial: require('../../assets/axnol/ind_industrial.webp'),
  ind_construction: require('../../assets/axnol/ind_construction.webp'),
  ind_marine: require('../../assets/axnol/ind_marine.webp'),
  ind_agricultural: require('../../assets/axnol/ind_agricultural.webp'),
  ind_energy: require('../../assets/axnol/ind_energy.webp'),
  feat_prod1_img: require('../../assets/axnol/product1.webp'),
  feat_prod2_img: require('../../assets/axnol/product1.webp'),
  feat_prod3_img: require('../../assets/axnol/product1.webp'),
  feat_prod4_img: require('../../assets/axnol/product1.webp'),

  // Onboarding
  onboard_slide1_bg: require('../../assets/axnol/onboard_slide1_hd.webp'),
  onboard_slide2_bg: require('../../assets/axnol/onboard_slide2_bg.webp'),
  onboard_slide3_bg: require('../../assets/axnol/onboard_slide3_bg.webp'),

  // Home banners
  banner_category_1: require('../../assets/axnol/banner_category_1.webp'),

  // Products
  product_oil: require('../../assets/axnol/product1.webp'),
  product_grease: require('../../assets/axnol/product1.webp'),
  product_forge: require('../../assets/axnol/product1.webp'),
  product_cutting: require('../../assets/axnol/product1.webp'),
  product_food: require('../../assets/axnol/product1.webp'),
  product_generic: require('../../assets/axnol/product1.webp'),
  product_baseoil: require('../../assets/axnol/product1.webp'),
  product_chem: require('../../assets/axnol/product1.webp'),
  product_mro: require('../../assets/axnol/product1.webp'),
  product_punch: require('../../assets/axnol/product1.webp'),
  product_wax: require('../../assets/axnol/product1.webp'),
} as const;

export type ImageKey = keyof typeof images;

export const resolveImage = (
  key?: string | null,
): ImageSourcePropType | undefined =>
  (images as Record<string, ImageSourcePropType | undefined>)[key ?? ''];

export default images;
