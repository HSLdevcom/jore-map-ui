'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const paths = require('../config/paths');
const config = require('../config/webpack.config.dev');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

function ensureRequiredFiles() {
  const required = [paths.appHtml, paths.appIndexJs];
  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length) {
    console.error(
      chalk.red(
        `Missing required file(s):\n${missing.map((m) => `  - ${m}`).join('\n')}`
      )
    );
    process.exit(1);
  }
}

async function start() {
  ensureRequiredFiles();

  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
  const port = DEFAULT_PORT;

  const compiler = webpack(config);

  // WebpackDevServer v4 signature: new WebpackDevServer(options, compiler)
  const server = new WebpackDevServer(
    {
      host: HOST,
      port,
      hot: true,
      historyApiFallback: true,

      // Serve /public (adjust if your setup differs)
      static: {
        directory: paths.appPublic,
        publicPath: '/',
        watch: true,
      },

      client: {
        overlay: true,
        logging: 'info',
      },

      allowedHosts: 'all',
    },
    compiler
  );

  await server.start();

  console.log(chalk.cyan('Starting the development server...\n'));
  console.log(chalk.cyan(`  ${protocol}://${HOST}:${port}\n`));

  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig, async () => {
      try {
        await server.stop();
      } finally {
        process.exit();
      }
    });
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});