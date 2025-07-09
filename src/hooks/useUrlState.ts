import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { paginationState, filtersState } from '../store/countryStore';
import { PAGINATION_OPTIONS } from '../utils/constants';

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useRecoilState(paginationState);
  const [filters, setFilters] = useRecoilState(filtersState);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add pagination params
    if (pagination.page > 1) {
      params.set('page', pagination.page.toString());
    }
    if (pagination.limit !== 10) {
      params.set('limit', pagination.limit.toString());
    }
    
    // Add filter params
    if (filters.continent) {
      params.set('continent', filters.continent);
    }
    if (filters.currency) {
      params.set('currency', filters.currency);
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    
    setSearchParams(params, { replace: true });
  }, [pagination.page, pagination.limit, filters.continent, filters.currency, filters.search, setSearchParams]);

  // Update state when URL changes
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const continentParam = searchParams.get('continent');
    const currencyParam = searchParams.get('currency');
    const searchParam = searchParams.get('search');

    // Update pagination
    const newPage = pageParam ? parseInt(pageParam, 10) : 1;
    const newLimit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Validate limit is one of the allowed options
    const validLimit = PAGINATION_OPTIONS.includes(newLimit as any) ? newLimit : 10;
    
    setPagination(prev => ({
      ...prev,
      page: isNaN(newPage) || newPage < 1 ? 1 : newPage,
      limit: validLimit,
    }));

    // Update filters
    setFilters({
      continent: continentParam || undefined,
      currency: currencyParam || undefined,
      search: searchParam || undefined,
    });
  }, [searchParams, setPagination, setFilters]);
};