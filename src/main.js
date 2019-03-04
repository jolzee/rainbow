import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "vue2-animate/dist/vue2-animate.min.css";
import {
  LineScaleLoader,
  BallScaleRippleMultipleLoader,
  LineScalePulseOutRapidLoader,
  BallPulseSyncLoader
} from "vue-loaders";
Vue.component(LineScaleLoader.name, LineScaleLoader);
Vue.component(LineScalePulseOutRapidLoader.name, LineScalePulseOutRapidLoader);
Vue.component(BallPulseSyncLoader.name, BallPulseSyncLoader);
Vue.component(
  BallScaleRippleMultipleLoader.name,
  BallScaleRippleMultipleLoader
);
Vue.use(require("vue-shortkey"));

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
