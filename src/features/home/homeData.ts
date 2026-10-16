import {ImageKey} from '../../assets/images';

export interface IndustryItem {
  id: string;
  name: string;
  image: ImageKey;
}

export interface HomeProduct {
  id: string;
  name: string;
  code: string;
  image: ImageKey;
}

export type CategoryIcon =
  | 'grease'
  | 'hydraulic'
  | 'gear'
  | 'cutting'
  | 'rust'
  | 'synthetic';

export interface CategoryItem {
  id: string;
  name: string;
  icon: CategoryIcon;
}

export interface HomeBannerItem {
  id: string;
  tagline: string;
  /** Wrap words in *asterisks* to highlight them in blue */
  title: string;
  description: string;
  image: ImageKey;
}

export const HOME_BANNERS: HomeBannerItem[] = [
  {
    id: 'industrial-1',
    tagline: 'Premium Lubricants',
    title: 'Powering *Every Industry* Forward',
    description:
      'High-performance lubricants engineered for superior efficiency and longer equipment life.',
    image: 'banner_industrial',
  },
  {
    id: 'industrial-2',
    tagline: 'Advanced Protection',
    title: 'Built to Keep You *Running Longer*',
    description:
      'Reliable lubrication solutions designed for the most demanding industrial applications.',
    image: 'banner_industrial',
  },
  {
    id: 'industrial-3',
    tagline: 'Trusted Quality',
    title: 'One Range for *Every Machine*',
    description:
      'From engine oils to industrial fluids — complete coverage for every sector you serve.',
    image: 'banner_industrial',
  },
];

export const INDUSTRIES: IndustryItem[] = [
  {id: 'ind2', name: 'Automotive', image: 'ind_automotive'},
  {id: 'ind1', name: 'Industrial', image: 'ind_industrial'},
  {id: 'ind6', name: 'Construction', image: 'ind_construction'},
  {id: 'ind4', name: 'Marine', image: 'ind_marine'},
  {id: 'ind5', name: 'Agricultural', image: 'cat_industrial'},
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-grease',
    name: 'Industrial Greases',
    icon: 'grease',
  },
  {
    id: 'cat-hydraulic',
    name: 'Hydraulic Oils',
    icon: 'hydraulic',
  },
  {
    id: 'cat-gear',
    name: 'Gear Oils',
    icon: 'gear',
  },
  {
    id: 'cat-cutting',
    name: 'Cutting Fluids',
    icon: 'cutting',
  },
  {
    id: 'cat-rust',
    name: 'Rust Preventives',
    icon: 'rust',
  },
  {
    id: 'cat-synthetic',
    name: 'Synthetic Oils',
    icon: 'synthetic',
  },
];

export const FEATURED_PRODUCTS: HomeProduct[] = [
  {
    id: 'p1',
    name: 'Engine Oil 15W-40',
    code: 'AXN-EN-1540',
    image: 'feat_prod1_img',
  },
  {
    id: 'p2',
    name: 'Hydraulic Oil AW 68',
    code: 'AXN-HY-068',
    image: 'feat_prod2_img',
  },
  {
    id: 'p3',
    name: 'Gear Oil EP 90',
    code: 'AXN-GR-090',
    image: 'feat_prod3_img',
  },
  {
    id: 'p4',
    name: 'Compressor Oil',
    code: 'AXN-CP-100',
    image: 'feat_prod4_img',
  },
];

export const ALL_PRODUCTS: HomeProduct[] = [
  {
    id: 'a1',
    name: 'Engine Oil AX-1000',
    code: 'AXN-EN-1000',
    image: 'product_oil',
  },
  {
    id: 'a2',
    name: 'Lithium Grease EP-2',
    code: 'AXN-GR-EP2',
    image: 'product_grease',
  },
  {
    id: 'a3',
    name: 'Hydraulic Oil AW 46',
    code: 'AXN-HY-046',
    image: 'product_baseoil',
  },
  {
    id: 'a4',
    name: 'Cutting Oil SOL-30',
    code: 'AXN-CT-030',
    image: 'product_cutting',
  },
  {
    id: 'a5',
    name: 'Gear Oil EP 90',
    code: 'AXN-GR-090',
    image: 'product_drum',
  },
  {
    id: 'a6',
    name: 'Industrial Solvent X',
    code: 'AXN-SL-010',
    image: 'product_chem',
  },
  {
    id: 'a7',
    name: 'MRO Maintenance Kit',
    code: 'AXN-MR-200',
    image: 'product_mro',
  },
  {
    id: 'a8',
    name: 'Protective Wax Coating',
    code: 'AXN-WX-050',
    image: 'product_wax',
  },
];
