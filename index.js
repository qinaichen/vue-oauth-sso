/**
 * Vue OAuth2.0 authorization_code 模式登录
 */
let installed = false;
import http from './lib/http'
const { getAccessToken, refreshToken, checkToken, logout } = http;
export default {

    install(Vue, options = {}) {
        if (installed) {
            return;
        }
        installed = true;
        const watch = new Vue({
            data() {
                return {
                    authenticated: false,
                    authInfo: {
                        access_token: '',
                        refresh_token: '',
                        expires_in: 0,
                        startTime: 0,
                        endTime: ''
                    },
                    updateTokenInterval: ''
                }
            },
            methods: {
                clear() {
                    clearInterval(this.updateTokenInterval);
                },
                async login() {

                    let search = window.location.search;
                    let searchArray = search.split('?');
                    if (searchArray.length > 1) {
                        let paramArray = searchArray[1].split('&');
                        let paramObj = {};
                        paramArray.forEach(item => {
                            let args = item.split('=');
                            paramObj[args[0]] = args[1];
                        });
                        if (!paramObj['code']) {
                            this.redrectLogin();
                            return false;
                        }
                        var result;
                        try {
                            result = await getAccessToken(options.config, paramObj['code']);
                            this.authenticated = true;
                        } catch (error) {
                            console.log(error);
                        }

                        const { access_token, refresh_token, expires_in } = result;
                        this.authInfo = {
                            access_token,
                            refresh_token,
                            expires_in,
                            startTime: parseInt(Date.now() / 1000),
                            endTime: parseInt(Date.now() / 1000) + expires_in
                        };
                        Object.defineProperty(Vue.prototype, 'oauth', {
                            get() {
                                return watch
                            }
                        })
                        options.onReady(this.authInfo);
                        this.updateTokenInterval = setInterval(() => {
                            this.checkToken().then((res) => {
                                if (!res) {
                                    this.authenticated = false;
                                    this.authInfo = {
                                        access_token: '',
                                        refresh_token: '',
                                        expires_in: 0,
                                        startTime: 0,
                                        endTime: 0
                                    };
                                    this.redrectLogin();
                                    this.clear();
                                }
                            });

                        }, 10000);
                    } else {
                        this.redrectLogin();
                    }
                },
                redrectLogin() {
                    let { config } = options;
                    let loginUrl = `${config.url}?client_id=${config.client_id}` +
                        `&redirect_uri=${config.redirect_uri}&scope=${config.scope}&response_type=code`
                        + `&scope=${config.scope}`;
                    window.location.href = loginUrl;
                },
                async logout() {

                    const result = await logout(options.config.logoutUri);
                    console.log(result);
                    this.authenticated = false;
                    this.authInfo = {
                        access_token: '',
                        refresh_token: '',
                        expires_in: 0,
                        startTime: 0,
                        endTime: 0
                    };
                    this.redrectLogin();
                    this.clear();
                },
                async checkToken() {
                    const result = await checkToken(options.config, this.authInfo.access_token);
                    if (!result) {
                        // token已失效
                        this.redrectLogin();
                        return false;
                    }
                    if (this.authInfo['refresh_token']) {
                        const time = parseInt(this.authInfo.expires_in / 3);
                        // 当token的有效时间还剩三分之一时，就需要刷新token
                        if ((this.endTime - this.startTime) < time) {
                            try {
                                const { data } = await refreshToken(options.config, this.authInfo.refresh_token);
                                const { access_token, refresh_token, expires_in } = result;
                                this.authInfo = {
                                    access_token,
                                    refresh_token,
                                    expires_in,
                                    startTime: parseInt(Date.now() / 1000),
                                    endTime: parseInt(Date.now() / 1000) + expires_in
                                };
                            } catch (error) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            },

        });

        if (!watch.authenticated) {
            watch.login();
        }


    }
}