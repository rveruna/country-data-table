export const GET_COUNTRIES = `
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
