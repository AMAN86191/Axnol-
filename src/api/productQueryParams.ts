const PRODUCT_FILTER_ALIASES: Record<string, string> = {
  industryId: 'industry_id',
  categoryId: 'category_id',
  subCategoryId: 'sub_category_id',
};

const PRODUCT_SORT_ALIASES: Record<string, string> = {
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  'name-asc': 'name_asc',
  'name-desc': 'name_desc',
};

export const toProductApiParams = (
  params?: Record<string, any>,
): Record<string, any> => {
  const apiParams: Record<string, any> = {...(params ?? {})};

  Object.entries(PRODUCT_FILTER_ALIASES).forEach(([camelKey, snakeKey]) => {
    const value = apiParams[camelKey];
    if (value !== undefined && value !== null && value !== '') {
      apiParams[snakeKey] = value;
    }
    delete apiParams[camelKey];
  });

  Object.entries(apiParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      delete apiParams[key];
    }
  });

  if (Number(apiParams.page) === 1) {
    delete apiParams.page;
  }

  if (apiParams.sort === 'newest') {
    delete apiParams.sort;
  } else if (typeof apiParams.sort === 'string') {
    apiParams.sort = PRODUCT_SORT_ALIASES[apiParams.sort] ?? apiParams.sort;
  }

  return apiParams;
};
