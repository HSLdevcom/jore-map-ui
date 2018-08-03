var glob = require("glob");

module.exports = {
  entry: glob.sync("./src/**/*.scss"),
  output: {
      filename: '[name].scss.d.ts'
  },
  module: {
      loaders: [{
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            {
              loader: require.resolve("typings-for-css-modules-loader"),
              options: {
                modules: true,
                namedExport: true,
                camelCase: true,
                importLoaders: 1,
              }
            },
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }]
  }
};
