// my own proto functions
require("./utils/prototypes");
import serverconfig from "./config";
window.serverconfig = serverconfig;

// bootstrap css
import "bootstrap/dist/css/bootstrap.min.css";

// dateformatter
var dateFormat = require("dateformat");
Date.prototype.format = function(f) {
  return dateFormat(this, f);
};

//toastr
window.toastr = require("toastr");
window.toastr.options.preventDuplicates = true;
import "toastr/build/toastr.min.css";

// custom styles
import "./scss/globalstyle.scss";
import "./scss/vue-transitions.scss";

// fast click to disable touch delay
var attachFastClick = require("fastclick");
attachFastClick.attach(document.body);

// prepairing vue
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
require("./serviceworker/registerServiceWorker");

// initializing app
Vue.config.productionTip = true;
new Vue({
  router,
  data: {
    user: null,
    datefilter: null,
    getdata: null,
    mainData: null
  },
  render: h => h(App)
}).$mount("#app");
