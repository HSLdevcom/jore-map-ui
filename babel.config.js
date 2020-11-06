module.exports = process.env.CYPRESS_E2E
    ? {}
    : {
        presets: ["react-app", "@babel/preset-env"]
    };