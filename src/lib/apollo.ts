import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { GRAPHQL_ENDPOINT } from '../utils/constants';

const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          countries: {
            merge: false,
          },
          continents: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;