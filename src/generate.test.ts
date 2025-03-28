import { describe, it, expect } from 'vitest';
import generate from './generate';

describe('generate', () => {
  const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgevZzL1gdAFr88hb2
OF/2NxApJCzGCEDdfSp6VQO30hyhRANCAAQRWz+jn65BtOMvdyHKcvjBeBSDZH2r
1RTwjmYSi9R/zpBnuQ4EiMnCqfMPWiZqB4QdbAd0E7oH50VpuZ1P087G
-----END PRIVATE KEY-----`;

  it('should generate a valid JWT token', () => {
    const now = Math.floor(Date.now() / 1000);
    const options = {
      kid: 'ABCDEF1234',
      iss: 'TEAM123456',
      key: mockPrivateKey,
      alg: 'ES256',
      typ: 'JWT',
      iat: now,
      exp: now + 3600, // 1 hour from now
    };

    const token = generate(options);

    // Basic JWT structure check (header.payload.signature)
    expect(token).toMatch(
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
    );
  });

  it('should include all provided claims in the token', () => {
    const now = Math.floor(Date.now() / 1000);
    const options = {
      kid: 'ABCDEF1234',
      key: mockPrivateKey,
      alg: 'ES256',
      typ: 'JWT',

      // Claims
      iss: 'TEAM123456',
      sub: 'com.example.weatherkit-client',
      origin: 'https://example.com',
      iat: now,
      exp: now + 3600, // 1 hour from now
    };

    const token = generate(options);
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64').toString()
    );

    expect(decodedPayload).toMatchObject({
      iss: options.iss,
      sub: options.sub,
      origin: options.origin,
      iat: options.iat,
      exp: options.exp,
    });
  });
});
