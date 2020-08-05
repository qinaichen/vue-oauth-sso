# vue-oauth-sso

前后端分离开发模式下，基于`spring-cloud-starter-oauth2` 实现单点登录

## 如何使用

- 添加依赖
```bash
npm install vue-oauth-sso
```
- main.js 配置
```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import OAuth from 'vue-oauth-sso'

Vue.config.productionTip = false
Vue.use(VueAxios, axios);

const oauthInteceptor = () => {
  axios.interceptors.request.use(function (config) {
    config.headers.Authorization = `Bearer ${Vue.prototype.oauth.authInfo.access_token}`
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });
}

Vue.use(OAuth, {
  config: {
    url: 'http://localhost:8001/oauth/authorize',
    client_id: 'app',
    client_secret: '123',
    scope: 'all',
    redirect_uri: 'http://localhost:3000',
    logoutUri: '/oauth/logout',
    tokenUri: '/oauth/token',
    checkTokenUri: '/oauth/check_token'
  },
  onReady(auth) {
    oauthInteceptor();
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
});
```
