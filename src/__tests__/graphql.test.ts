import { afterEach, describe, expect, it, vi } from 'vitest';
import { graphqlRequest } from '../lib/graphql';

const respond = (body: unknown, init: ResponseInit = { status: 200 }) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), init));

afterEach(() => vi.unstubAllGlobals());

describe('graphqlRequest', () => {
  it('posts the query as JSON to the endpoint', async () => {
    const fetchMock = respond({ data: { ok: true } });
    vi.stubGlobal('fetch', fetchMock);

    await graphqlRequest('{ ok }', { endpoint: 'https://example.test/graphql' });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://example.test/graphql');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ 'content-type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({ query: '{ ok }' });
  });

  it('returns the data from the response', async () => {
    vi.stubGlobal('fetch', respond({ data: { countries: [{ code: 'US' }] } }));

    await expect(graphqlRequest('{ countries { code } }')).resolves.toEqual({ countries: [{ code: 'US' }] });
  });

  it('throws with the status when the server answers with an error status', async () => {
    vi.stubGlobal('fetch', respond({}, { status: 503 }));

    await expect(graphqlRequest('{ ok }')).rejects.toThrow('The request failed with status 503');
  });

  it('throws the GraphQL error messages, joined', async () => {
    vi.stubGlobal('fetch', respond({ errors: [{ message: 'Bad field' }, { message: 'Not allowed' }] }));

    await expect(graphqlRequest('{ ok }')).rejects.toThrow('Bad field; Not allowed');
  });

  it('throws when the response has neither data nor errors', async () => {
    vi.stubGlobal('fetch', respond({}));

    await expect(graphqlRequest('{ ok }')).rejects.toThrow('The response contained no data');
  });

  it('lets a network failure through with its own message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(graphqlRequest('{ ok }')).rejects.toThrow('Failed to fetch');
  });

  it('passes the abort signal to fetch', async () => {
    const fetchMock = respond({ data: {} });
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await graphqlRequest('{ ok }', { signal: controller.signal });

    expect((fetchMock.mock.calls[0] as [string, RequestInit])[1].signal).toBe(controller.signal);
  });
});
