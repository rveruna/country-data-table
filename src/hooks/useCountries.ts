import { useQuery } from '@apollo/client';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useEffect } from 'react';
import { GET_COUNTRIES } from '../graphql/queries';
import { CountriesData } from '../types/country';
import { 
  countriesState, 
  loadingState, 
  errorState,
  paginationState,
  filteredCountriesSelector
} from '../store/countryStore';
import { useRecoilValue } from 'recoil';

export const useCountries = () => {
  const [countries, setCountries] = useRecoilState(countriesState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [error, setError] = useRecoilState(errorState);
  const [pagination, setPagination] = useRecoilState(paginationState);
  const filteredCountries = useRecoilValue(filteredCountriesSelector);

  const { data, loading: queryLoading, error: queryError } = useQuery<CountriesData>(
    GET_COUNTRIES,
    {
      errorPolicy: 'all',
    }
  );

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    } else {
      setError(null);
    }
  }, [queryError, setError]);

  useEffect(() => {
    if (data?.countries) {
      setCountries(data.countries);
    }
  }, [data, setCountries]);

  useEffect(() => {
    const total = filteredCountries.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    setPagination(prev => ({
      ...prev,
      total,
      totalPages,
      page: prev.page > totalPages ? 1 : prev.page
    }));
  }, [filteredCountries.length, pagination.limit, setPagination]);

  const refetch = () => {
    return queryLoading;
  };

  return {
    countries,
    loading,
    error,
    refetch,
  };
};