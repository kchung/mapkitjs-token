import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  MockedFunction,
  Mocked,
} from 'vitest';
import https from 'https';
import http from 'http';
import verify from './verify';

vi.mock('https', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('verify', () => {
  const mockToken = 'test.jwt.token';
  const mockOrigin = 'https://example.com';
  const mockVersion = '5.38.1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve when status code is 200', async () => {
    vi.mocked(https.get).mockImplementation(
      (
        path: string,
        options: https.RequestOptions,
        callback: (res: http.IncomingMessage) => void
      ) => {
        const mockResponse = {
          statusCode: 200,
        };

        const mockClientRequest = {
          on: vi.fn(),
        } as unknown as http.ClientRequest;

        callback(mockResponse as http.IncomingMessage);
        return mockClientRequest;
      }
    );

    const verifying = verify(mockToken, mockOrigin, mockVersion);
    await expect(verifying).resolves.toBe(true);
  });

  it('should reject when status code is not 200', async () => {
    vi.mocked(https.get).mockImplementation(
      (
        path: string,
        options: https.RequestOptions,
        callback: (res: http.IncomingMessage) => void
      ) => {
        const mockResponse = {
          statusCode: 401,
        };

        const mockClientRequest = {
          on: vi.fn(),
        } as unknown as http.ClientRequest;

        callback(mockResponse as http.IncomingMessage);
        return mockClientRequest;
      }
    );

    const verifying = verify(mockToken, mockOrigin, mockVersion);
    await expect(verifying).rejects.toBe(false);
  });

  it('should reject on network error', async () => {
    vi.mocked(https.get).mockImplementation(
      (
        path: string,
        options: https.RequestOptions,
        callback: (res: http.IncomingMessage) => void
      ) => {
        const mockClientRequest = {
          on: (event: string, handler: (error: Error) => void) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
          },
        } as http.ClientRequest;

        return mockClientRequest;
      }
    );

    const verifying = verify(mockToken, mockOrigin, mockVersion);
    await expect(verifying).rejects.toBe(false);
  });

  it('should use default values when not provided', async () => {
    vi.mocked(https.get).mockImplementation(
      (
        path: string,
        options: https.RequestOptions,
        callback: (res: http.IncomingMessage) => void
      ) => {
        const mockResponse = {
          statusCode: 200,
        };

        const mockClientRequest = {
          on: vi.fn(),
        } as unknown as http.ClientRequest;

        callback(mockResponse as http.IncomingMessage);
        return mockClientRequest;
      }
    );

    const verifying = verify(mockToken);
    await expect(verifying).resolves.toBe(true);
  });
});
