# MapKit JS Token Generator

Generate long-lived tokens from the CLI to be used with the MapKit JS [`authorizationCallback`](https://developer.apple.com/documentation/mapkitjs/creating_and_using_tokens_with_mapkit_js#3138220):

> Setting `authorizationCallback` to a function that returns a token as a string is useful for local development, or if you want to use a long-lived token with MapKit JS. Sign a token locally on your development machine with an expiration, then use the token directly in your code. Whether you are using a short-lived or long-lived token, setting the origin claim is always recommended.



## Usage

```
$ npx mapkitjs-token [options]
```

Since we're dealing with private keys, you may feel safer to compile this tool yourself and run it locally (See the "Compiling" section in `README`).


### Options
```
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --kid      A 10-character key identifier (kid) key, obtained from your Apple
             Developer account                               [string] [required]
  --iss      The Issuer (iss) registered claim key. This key's value is your
             10-character Team ID, obtained from your developer account.
                                                             [string] [required]
  --iat      The Issued At (iat), relative to now. Uses `zeit/ms` strings (e.g
             '0', '2 days', '10 years')
                  [string] [default: 0, current time (e.g 0 seconds from "now")]
  --exp      The Expiration Time (exp) relative to `iat`, using a `zeit/ms`
             string (e.g '1hr, '2 days', '10 years').
                                      [string] [default: 1hr, 1 hour expiration]
  --key      MapKit private key file path                             [required]
  --origin   The Origin (origin) key. This key's value is a fully qualified
             domain that should match the Origin header passed by a browser.
                                                                        [string]
  --verify   Test the generated token with MapKit servers to verify if valid
                 [boolean] [default: true, will verify token after it generates]
  --stdout   Set to true to output only the token, suitable for piping
      [boolean] [default: false, by default, outputs extra data about the token]
```

See the [MapKit JS Documentation](https://developer.apple.com/documentation/mapkitjs/creating_and_using_tokens_with_mapkit_js) for the full explanation of these options.

### Examples

Generate a token with the default expiration (1 hour) and verify the token works:

```
$ npx mapkitjs-token --kid ABC123DEFG --iss DEF123GHIJ --key secret.p8

Token Information:
Key Id (kid)  ABC123DEFG
Issuer (iss)  DEF123GHIJ
Issued (iat)  1583626697 (Sat Mar 07 2020 16:18:17 GMT-0800 (Pacific Standard Time))
Expire (exp)  1583630297 (Sat Mar 07 2020 17:18:17 GMT-0800 (Pacific Standard Time))
Expires In    1 hour (3600s)
Origin        none
Valid         valid
Token         [generated token]
```

Generate a token with a 10 year expiration, verify, and copy directly to clipboard (OSX):

```
$ npx mapkitjs-token --kid ABC123DEFG --iss DEF123GHIJ --key secret.p8  --exp 10y --stdout | pbcopy 
```

Generate a token with a 8 year expiration, add an origin, and skip verification:

```
$ npx mapkitjs-token --kid ABC123DEFG --iss DEF123GHIJ --key secret.p8 --exp=8y --origin https://mywebsite.org --verify=false

Token Information:
Key Id (kid)  ABC123DEFG
Issuer (iss)  DEF123GHIJ
Issued (iat)  1583627770 (Sat Mar 07 2020 16:36:10 GMT-0800 (Pacific Standard Time))
Expire (exp)  1836088570 (Tue Mar 07 2028 16:36:10 GMT-0800 (Pacific Standard Time))
Expires In    2922 days (252460800s)
Origin        https://mywebsite.org
Valid         skipped
Token         [generated token]
```

## Compiling


```
$ npm ci
$ npm run build
$ node ./dist/cli.js
```
