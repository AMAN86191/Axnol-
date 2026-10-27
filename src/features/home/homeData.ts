export interface IndustryItem {
  id: string;
  name: string;
  image: string;
}

export interface HomeProduct {
  id: string;
  name: string;
  code: string;
  image: string;
  price: number;
  mrp?: number;
  unit?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  industryId?: string;
}

export interface HomeBannerItem {
  id: string;
  tagline: string;
  /** Wrap words in *asterisks* to highlight them in blue */
  title: string;
  description: string;
  image: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  pdfUrl?: string | null;
  navigationLink?: string | null;
}
