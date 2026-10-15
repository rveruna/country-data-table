import { useCallback, useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { GET_COUNTRIES } from '../graphql/queries';
import { graphqlRequest } from '../lib/graphql';
import { CountriesData } from '../types/country';
import { countriesAtom, errorAtom, loadingAtom } from '../store/countryStore';

/** Loads the countries once, and again whenever `refetch` is called. */
export const useCountries = () => {
  const setCountries = useSetAtom(countriesAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    graphqlRequest<CountriesData>(GET_COUNTRIES, { signal: controller.signal })
      .then((data) => setCountries(data.countries))
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Something went wrong');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Leaving the page, or retrying, cancels the request that is still in flight
    return () => controller.abort();
  }, [attempt, setCountries, setError, setLoading]);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);

  return { loading, error, refetch };
};
