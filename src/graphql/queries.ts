import { gql } from '@apollo/client';

export const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      name
      code
      continent {
        name
      }
      currency
    }
  }
`;

export const GET_CONTINENTS = gql`
  query GetContinents {
    continents {
      name
    }
  }
`;

export const GET_COUNTRY_BY_CODE = gql`
  query GetCountryByCode($code: ID!) {
    country(code: $code) {
      name
      code
      continent {
        name
      }
      currency
    }
  }
`;