import { useQuery } from '@apollo/client';
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { GET_COUNTRIES } from '../graphql/queries';
import { CountriesData } from '../types/country';
import { 
  countriesState, 
  loadingState, 
  errorState,
} from '../store/countryStore';

export const useCountries = () => {
  const [countries, setCountries] = useRecoilState(countriesState);
  const [loading, setLoading] = useRecoilState(loadingState);
  const [error, setError] = useRecoilState(errorState);

  const { data, loading: queryLoading, error: queryError, refetch } = useQuery<CountriesData>(
    GET_COUNTRIES,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
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

  return {
    countries,
    loading,
    error,
    refetch,
  };
};