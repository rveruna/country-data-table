import { GRAPHQL_ENDPOINT } from '../utils/constants';

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

interface RequestOptions {
  signal?: AbortSignal;
  endpoint?: string;
}

/**
 * Sends a GraphQL query with fetch and returns its data. Throws an Error with a readable message when the
 * request fails, the server answers with an error status, or the response carries GraphQL errors.
 */
export async function graphqlRequest<T>(
  query: string,
  { signal, endpoint = GRAPHQL_ENDPOINT }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`The request failed with status ${response.status}`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }
  if (!body.data) {
    throw new Error('The response contained no data');
  }
  return body.data;
}
