import https from 'https';
import querystring from 'querystring';

/**
 * @const MapKitJS bootstrap path
 */
const BOOTSTRAP_PATH = 'https://cdn.apple-mapkit.com/ma/bootstrap';

/**
 * Verify if the JWT token will work with MapKitJS endpoints
 * @param token JWT token
 * @param [origin = 'https://localhost'] Issuing origin
 * @param [version = '5.38.1'] MapKitJS version
 */
export default function verify(
  token: string,
  origin = 'https://localhost',
  version = '5.38.1'
) {
  return new Promise<boolean>((resolve, reject) => {
    const query = querystring.stringify({
      apiVersion: 2,
      mkjsVersion: version,
      poi: 1,
    });

    const path = `${BOOTSTRAP_PATH}?${query}`;
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: origin,
        Referer: origin,
      },
    };

    https
      .get(path, options, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          reject(false);
        }
      })
      .on('error', () => reject(false));
  });
}
