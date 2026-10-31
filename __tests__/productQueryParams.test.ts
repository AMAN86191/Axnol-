import {toProductApiParams} from '../src/api/productQueryParams';

describe('toProductApiParams', () => {
  it('converts industry, category, and subcategory IDs to API names', () => {
    expect(
      toProductApiParams({
        industryId: 1,
        categoryId: 3,
        subCategoryId: 7,
        page: 1,
      }),
    ).toEqual({
      industry_id: 1,
      category_id: 3,
      sub_category_id: 7,
    });
  });

  it('converts price sorting and retains category and page parameters', () => {
    expect(
      toProductApiParams({
        categoryId: 3,
        sort: 'price-asc',
        page: 2,
      }),
    ).toEqual({
      category_id: 3,
      sort: 'price_asc',
      page: 2,
    });
  });

  it.each([
    ['price-asc', 'price_asc'],
    ['price-desc', 'price_desc'],
    ['name-asc', 'name_asc'],
    ['name-desc', 'name_desc'],
  ])('converts %s sorting to %s', (sort, apiSort) => {
    expect(toProductApiParams({sort})).toEqual({sort: apiSort});
  });

  it('omits default sorting and empty filters', () => {
    expect(
      toProductApiParams({
        industryId: '',
        categoryId: undefined,
        subCategoryId: null,
        sort: 'newest',
        page: 1,
      }),
    ).toEqual({});
  });
});
