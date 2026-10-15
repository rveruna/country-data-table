export const PAGINATION_OPTIONS = [10, 20, 50, 100] as const;

export const CONTINENTS = [
  'Africa',
  'Antarctica', 
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America'
] as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
};

export const GRAPHQL_ENDPOINT: string =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? 'https://countries.trevorblades.com/graphql';