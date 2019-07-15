var manifestJSON = require("./public/manifest.json");

pwaArgs = {
  themeColor: manifestJSON.theme_color,
  name: manifestJSON.short_name,
  msTileColor: manifestJSON.background_color
};
module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin("pwa").tap(args => {
      return [pwaArgs];
    });
  },
  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "./src/serviceworker/service-worker.js"
    }
    // iconPaths: {
    //   favicon32: "img/icons/favicon-32x32.png",
    //   favicon16: "img/icons/favicon-16x16.png",
    //   appleTouchIcon: "img/icons/apple-touch-icon-152x152.png",
    //   maskIcon: "img/icons/safari-pinned-tab.svg",
    //   msTileImage: "img/icons/msapplication-icon-144x144.png",
    // },
  },
  outputDir: "docs",
  publicPath: "/map/"
};
