import jwt from 'jsonwebtoken';

interface PayloadConfig {
  iss: string;
  iat: number;
  exp: number;
  sub?: string;
  origin?: string;
}

interface HeaderConfig {
  alg: string;
  kid: string;
  typ: string;
}

interface GenerateConfig {
  key: string;
}

export type GenerateOptions = PayloadConfig & HeaderConfig & GenerateConfig;

/**
 * Generate MapKit token
 * @param options
 * @returns {String} MapKit token
 */
export default function generate(options: GenerateOptions) {
  const header: HeaderConfig = {
    alg: options.alg,
    kid: options.kid,
    typ: options.typ,
  };

  const payload: PayloadConfig = {
    iss: options.iss,
    iat: options.iat,
    exp: options.exp,
  };

  if (options.sub) {
    payload.sub = options.sub;
  }

  if (options.origin) {
    payload.origin = options.origin;
  }

  return jwt.sign(payload, options.key, { header });
}
