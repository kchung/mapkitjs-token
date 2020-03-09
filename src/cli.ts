#!/usr/bin/env node

import fs from 'fs';
import ms from 'ms';
import yargs from 'yargs';
import chalk from 'chalk';
import generate, { GenerateOptions } from './generate';
import verify from './verify';

type RunOptions = GenerateOptions & {
  verify: boolean;
  stdout: boolean;
}

const DOC_URL = 'https://developer.apple.com/documentation/mapkitjs/creating_a_maps_identifier_and_a_private_key';

const now = new Date();

const argv = yargs
  .options({
    'alg': {
      default: 'ES256',
      defaultDescription: 'ES256',
      type: 'string',
      hidden: true,
      describe: 'The encryption algorithm (alg) used to encrypt the token. ES256 should be used to encrypt your token, and the value for this field should be "ES256".'
    },
    'kid': {
      type: 'string',
      describe: 'A 10-character key identifier (kid) key, obtained from your Apple Developer account',
      demandOption: true,
    },
    'typ': {
      default: 'JWT',
      defaultDescription: 'JWT',
      type: 'string',
      hidden: true,
      describe: 'A type parameter (typ), with the value "JWT".',
    },
    'iss': {
      type: 'string',
      describe: 'The Issuer (iss) registered claim key. This key\'s value is your 10-character Team ID, obtained from your developer account.',
      demandOption: true,
    },
    'iat': {
      default: '0',
      defaultDescription: '0, current time (e.g 0 seconds from "now")',
      type: 'string',
      describe: 'The Issued At (iat), relative to now. Uses `zeit/ms` strings (e.g \'0\', \'2d\', \'1y\')',
    },
    'exp': {
      default: '364d',
      defaultDescription: '364d, 364 day expiration',
      describe: 'The Expiration Time (exp) relative to `iat`, using a `zeit/ms` string (e.g \'1hr\, \'2d\', \'1y\').',
      type: 'string',
    },
    'key': {
      demandOption: true,
      describe: 'MapKit private key file path',
      coerce(file) {
        if (!file) {
          throw new Error('No key file path');
        }

        const contents = fs.readFileSync(file, { encoding: 'utf8' });
        if (!contents.startsWith('-----BEGIN PRIVATE KEY-----') || !contents.endsWith('-----END PRIVATE KEY-----')) {
          throw new Error(`Key file likely invalid (see ${DOC_URL})`);
        }

        return contents;
      },
    },
    'origin': {
      describe: 'The Origin (origin) key. This key\'s value is a fully qualified domain that should match the Origin header passed by a browser.',
      type: 'string',
    },
    'verify': {
      default: true,
      defaultDescription: 'true, will verify token after it generates',
      describe: 'Test the generated token with MapKit servers to verify if valid',
      boolean: true,
    },
    'stdout': {
      default: false,
      defaultDescription: 'false, by default, outputs extra data about the token',
      describe: 'Set to true to output only the token, suitable for piping',
      boolean: true,
    },
  })
  .coerce('iat', (iat: string) => {
    const milliseconds = now.getTime() + ms(iat);
    return Math.round(milliseconds / 1000);
  })
  .coerce('exp', (exp: string) => {
    const milliseconds = now.getTime() + ms(exp);
    return Math.round(milliseconds / 1000);
  })
  .argv;

/**
 * Output the result with the configurations used
 * @param args
 * @param token Generated token
 * @param valid Valididty if boolean, `null` if skipped
 */
function output(args: RunOptions, token: string, valid: null | boolean) {
  const seconds = args.exp - args.iat;
  const milliseconds = seconds * 1000;

  const list = [
    ['Key Id (kid)', args.kid],
    ['Issuer (iss)', args.iss],
    ['Issued (iat)', args.iat, `(${new Date(args.iat * 1000)})`],
    ['Expire (exp)', args.exp, `(${new Date(args.exp * 1000)})`],
    ['Expires In', `${ms(milliseconds, { long: true })} (${seconds}s)`],
    ['Origin', args?.origin || chalk.yellow('none')],
  ];

  // Color code valid results
  if (valid === null) {
    list.push(['Valid', chalk.yellow('skipped')]);
  } else if (valid === true) {
    list.push(['Valid', chalk.green('valid')]);
  } else if (valid === false) {
    list.push(['Valid', chalk.red('invalid')]);
  }

  list.push(['Token', token]);

  // Figure out max-width to give output some alignment
  const maxWidth = list.reduce((max, [name]) => {
    return Math.max(max, name.toString().length);
  }, 0);

  const output = list.map(([name, ...value]) => {
    const title = name.toString().padEnd(maxWidth);
    return `${chalk.bold(title)}  ${value.join(' ')}`;
  });

  console.log();
  console.log(chalk.bold.underline('Token Information:'));
  console.log(output.join('\n'));
  console.log();

  if (valid === false) {
    console.error(chalk.redBright('Token failed to validate!'));
    console.log(`See docs: ${DOC_URL}`);
  }
}

/**
 * CLI run command
 * @param args
 */
async function run(args: RunOptions) {
  const token = generate(args);

  // Validate the token if request
  let valid = null;
  if (args.verify) {
    try {
      await verify(token, args.origin);
      valid = true;
    } catch (e) {
      valid = false;
    }
  }

  // Exit if the token doesn't seem valid
  if (valid === false) {
    output(args, token, valid);
    process.exit(1);
  }

  if (!args.stdout) {
    output(args, token, valid);
  } else {
    console.log(token);
  }
}

run(argv);
