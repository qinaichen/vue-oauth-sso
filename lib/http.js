import axios from 'axios';
import constant from './constant'

const { SCOPE, REDIRECT_URI, CODE, AUTHORIZATION_CODE, REFRESH_TOKEN } = constant;

export default {
    /**
     * 获取token信息
     */

    async getAccessToken(config, code) {

        const { data } = await axios({
            url: config.tokenUri,
            method: 'POST',
            auth: {
                username: config.client_id,
                password: config.client_secret
            },
            params: {
                scope: config[SCOPE],
                redirect_uri: config[REDIRECT_URI],
                grant_type: AUTHORIZATION_CODE,
                code: code
            }
        });
        return data;
    },
    // 刷新token信息
    async refreshToken(config, refresh_token) {
        const { data } = await axios({
            url: config.tokenUri,
            params: {
                grant_type: REFRESH_TOKEN,
                refresh_token: refresh_token,
                client_id: config.client_id,
                client_secret: config.client_secret
            }
        });
    },
    /**
     * 检测token 是否有效
     * @param {*} config  基本配置信息
     * @param {*} token  当前的token信息
     */
    async checkToken(config, token) {
        try {
            const { data } = await axios({
                url: config.checkTokenUri,
                method: 'POST',
                auth: {
                    username: config.client_id,
                    password: config.client_secret
                },
                params: {
                    token: token
                }
            });
            return true == data['active'];
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    async logout(logoutUrl) {
        try {
            const { data } = await axios.post(logoutUrl);
            return data;
        } catch (error) {
            return false;
        }

    }
}