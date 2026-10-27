/**
 * Local image registry resolved by AppImage.
 */
import type {ImageSourcePropType} from 'react-native';

const images = {
  user_avatar: require('../../assets/axnol/default_avatar.png'),
  register_corner_bg: require('../../assets/axnol/register_corner_bg.png'),

  // New Home Screen Assets
  ind_automotive: require('../../assets/axnol/ind_automotive.jpg'),
  ind_industrial: require('../../assets/axnol/ind_industrial.jpg'),
  ind_construction: require('../../assets/axnol/ind_construction.jpg'),
  ind_marine: require('../../assets/axnol/ind_marine.png'),
  ind_agricultural: require('../../assets/axnol/ind_agricultural.png'),
  ind_energy: require('../../assets/axnol/ind_energy.png'),
  feat_prod1_img: require('../../assets/axnol/product1.png'),
  feat_prod2_img: require('../../assets/axnol/product1.png'),
  feat_prod3_img: require('../../assets/axnol/product1.png'),
  feat_prod4_img: require('../../assets/axnol/product1.png'),

  // Onboarding
  onboard_slide1_bg: require('../../assets/axnol/onboard_slide1_hd.png'),
  onboard_slide2_bg: require('../../assets/axnol/Golden Ribbon Drive at Sunset.png'),
  onboard_slide3_bg: require('../../assets/axnol/AXNOL Lubricants_ Power in Motion.png'),

  // Home banners
  banner_category_1: require('../../assets/axnol/banner_category_1.png'),

  // Products
  product_oil: require('../../assets/axnol/product1.png'),
  product_grease: require('../../assets/axnol/product1.png'),
  product_forge: require('../../assets/axnol/product1.png'),
  product_cutting: require('../../assets/axnol/product1.png'),
  product_food: require('../../assets/axnol/product1.png'),
  product_generic: require('../../assets/axnol/product1.png'),
  product_baseoil: require('../../assets/axnol/product1.png'),
  product_chem: require('../../assets/axnol/product1.png'),
  product_mro: require('../../assets/axnol/product1.png'),
  product_punch: require('../../assets/axnol/product1.png'),
  product_wax: require('../../assets/axnol/product1.png'),
} as const;

export type ImageKey = keyof typeof images;

export const resolveImage = (
  key?: string | null,
): ImageSourcePropType | undefined =>
  (images as Record<string, ImageSourcePropType | undefined>)[key ?? ''];

export default images;
