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
  price: number;
  mrp?: number;
  unit?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  image: ImageKey;
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
  // {
  //   id: 'industrial-1',
  //   tagline: 'Premium Lubricants',
  //   title: 'Powering *Every Industry* Forward',
  //   description:
  //     'High-performance lubricants.',
  //   image: 'banner_industrial_1',
  // },
  {
    id: 'industrial-2',
    tagline: 'Advanced Protection',
    title: 'Built to Keep You *Running Longer*',
    description:
      'Reliable lubrication solutions.',
    image: 'banner_industrial_2',
  },
  {
    id: 'industrial-3',
    tagline: 'Trusted Quality',
    title: 'One Range for *Every Machine*',
    description:
      'From engine oils to industrial fluids.',
    image: 'banner_industrial_3',
  },
];

export const INDUSTRIES: IndustryItem[] = [
  {id: 'ind2', name: 'Automotive', image: 'ind_automotive'},
  {id: 'ind1', name: 'Industrial', image: 'ind_industrial'},
  {id: 'ind6', name: 'Construction', image: 'ind_construction'},
  {id: 'ind4', name: 'Marine', image: 'ind_marine'},
  {id: 'ind3', name: 'Agriculture', image: 'ind_agricultural'},
  {id: 'ind8', name: 'Energy', image: 'ind_energy'},
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-grease',
    name: 'Industrial Greases',
    image: 'category_5',
  },
  {
    id: 'cat-hydraulic',
    name: 'Hydraulic Oils',
    image: 'category_6',
  },
  {
    id: 'cat-gear',
    name: 'Gear Oils',
    image: 'category_2',
  },
  {
    id: 'cat-cutting',
    name: 'Cutting Fluids',
    image: 'category_8',
  },
  {
    id: 'cat-rust',
    name: 'Rust Preventives',
    image: 'category_7',
  },
  {
    id: 'cat-synthetic',
    name: 'Synthetic Oils',
    image: 'category_1',
  },
];

export const FEATURED_PRODUCTS: HomeProduct[] = [
  {
    id: 'p1',
    name: 'Engine Oil 15W-40',
    code: 'AXN-EN-1540',
    image: 'feat_prod1_img',
    price: 1450,
    mrp: 1699,
    unit: '5L',
  },
  {
    id: 'p2',
    name: 'Hydraulic Oil AW 68',
    code: 'AXN-HY-068',
    image: 'feat_prod2_img',
    price: 2150,
    mrp: 2450,
    unit: '20L',
  },
  {
    id: 'p3',
    name: 'Gear Oil EP 90',
    code: 'AXN-GR-090',
    image: 'feat_prod2_img',
    price: 3200,
    mrp: 3600,
    unit: '20L',
  },
  {
    id: 'p4',
    name: 'Compressor Oil',
    code: 'AXN-CP-100',
    image: 'feat_prod4_img',
    price: 1890,
    mrp: 2150,
    unit: '20L',
  },
];

export const ALL_PRODUCTS: HomeProduct[] = [
  {
    id: 'a1',
    name: 'Engine Oil AX-1000',
    code: 'AXN-EN-1000',
    image: 'product_oil',
    price: 1299,
    mrp: 1499,
    unit: '5L',
  },
  {
    id: 'a2',
    name: 'Lithium Grease EP-2',
    code: 'AXN-GR-EP2',
    image: 'product_grease',
    price: 890,
    mrp: 1050,
    unit: '1kg',
  },
  {
    id: 'a3',
    name: 'Hydraulic Oil AW 46',
    code: 'AXN-HY-046',
    image: 'product_baseoil',
    price: 2050,
    mrp: 2340,
    unit: '20L',
  },
  {
    id: 'a4',
    name: 'Cutting Oil SOL-30',
    code: 'AXN-CT-030',
    image: 'product_cutting',
    price: 1650,
    mrp: 1890,
    unit: '20L',
  },
  {
    id: 'a5',
    name: 'Gear Oil EP 90',
    code: 'AXN-GR-090',
    image: 'product_cutting',
    price: 3200,
    mrp: 3600,
    unit: '20L',
  },
  {
    id: 'a6',
    name: 'Industrial Solvent X',
    code: 'AXN-SL-010',
    image: 'product_chem',
    price: 740,
    mrp: 860,
    unit: '5L',
  },
  {
    id: 'a7',
    name: 'MRO Maintenance Kit',
    code: 'AXN-MR-200',
    image: 'product_mro',
    price: 4999,
    mrp: 5600,
    unit: 'kit',
  },
  {
    id: 'a8',
    name: 'Protective Wax Coating',
    code: 'AXN-WX-050',
    image: 'product_wax',
    price: 1120,
    mrp: 1290,
    unit: '5L',
  },
];
