import axios from 'axios';
import md5 from 'js-md5';
import router from "../routes/router";
import Vue from 'vue';

// 创建一个通知辅助函数，使用项目已有的 $notify
const notify = {
    warning(message) {
        if (Vue.prototype.$notify) {
            Vue.prototype.$notify({
                type: 'warning',
                title: '警告',
                message: message,
                timeout: 1500
            });
        }
    },
    error(message) {
        if (Vue.prototype.$notify) {
            Vue.prototype.$notify({
                type: 'danger',
                title: '错误',
                message: message,
                timeout: 2000
            });
        }
    },
    success(message) {
        if (Vue.prototype.$notify) {
            Vue.prototype.$notify({
                type: 'success',
                title: '成功',
                message: message,
                timeout: 2000
            });
        }
    },
    info(message) {
        if (Vue.prototype.$notify) {
            Vue.prototype.$notify({
                type: 'info',
                title: '提示',
                message: message,
                timeout: 2000
            });
        }
    }
};

// 创建 axios 实例
const axiosInstance = axios.create({
    baseURL: '/api',
    timeout: 30000, // 30秒超时
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
});

// 请求拦截器 - 添加 token
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 统一处理错误
axiosInstance.interceptors.response.use(
    response => {
        // 处理业务状态码
        if (response.data) {
            const { status } = response.data;

            // 请求过于频繁
            if (status === 5) {
                notify.warning("請求太快，請等一下再試！");
            }
            // token 失效，需要重新登录
            else if (status === 6) {
                notify.warning("登录已过期，请重新登录");
                localStorage.removeItem('token');
                router.push("/login");
            }
        }

        return response;
    },
    error => {
        // 处理 HTTP 错误
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    notify.error("未授权，请登录");
                    localStorage.removeItem('token');
                    router.push("/login");
                    break;
                case 403:
                    notify.error("没有权限访问");
                    break;
                case 404:
                    notify.error("请求的资源不存在");
                    break;
                case 500:
                    notify.error("服务器错误");
                    break;
                case 502:
                case 503:
                case 504:
                    notify.error("服务暂时不可用，请稍后再试");
                    break;
                default:
                    notify.error(`请求失败: ${error.message}`);
            }
        } else if (error.request) {
            // 请求已发出但没有收到响应
            notify.error("网络连接失败，请检查网络");
        } else {
            // 其他错误
            notify.error(`请求错误: ${error.message}`);
        }

        return Promise.reject(error);
    }
);

/**
 * Letoy 服务类 - 封装所有 HTTP 请求
 */
const LetoyService = {
    /**
     * 发起需要授权的请求（带 token）
     * @param {string} url - API 路径（不需要 /api 前缀）
     * @param {string} method - 请求方法 GET/POST/PUT/DELETE
     * @param {object} params - URL 参数（GET 请求使用）
     * @param {object} data - 请求体数据（POST/PUT 请求使用）
     * @param {function} fallCallBack - 错误回调
     * @param {function} onFinalCallBack - 最终回调（无论成功失败都执行）
     * @returns {Promise} 返回响应数据
     */
    async authorizationRequest(url, method = 'GET', params = null, data = null, fallCallBack = null, onFinalCallBack = null) {
        try {
            const response = await axiosInstance({
                url: url.startsWith('/') ? url : `/${url}`,
                method,
                params,
                data
            });

            return response.data;
        } catch (error) {
            // 执行自定义错误回调
            if (fallCallBack && typeof fallCallBack === 'function') {
                fallCallBack(error);
            }
            return null;
        } finally {
            // 执行最终回调
            if (onFinalCallBack && typeof onFinalCallBack === 'function') {
                onFinalCallBack();
            }
        }
    },

    /**
     * 发起无需授权的请求（不带 token）
     * @param {string} url - API 路径（不需要 /api 前缀）
     * @param {string} method - 请求方法 GET/POST/PUT/DELETE
     * @param {object} params - URL 参数
     * @param {object} data - 请求体数据
     * @param {function} fallCallBack - 错误回调
     * @param {function} onFinalCallBack - 最终回调
     * @returns {Promise} 返回响应数据
     */
    async noAuthorizationRequest(url, method = 'GET', params = null, data = null, fallCallBack = null, onFinalCallBack = null) {
        try {
            const response = await axiosInstance({
                url: url.startsWith('/') ? url : `/${url}`,
                method,
                params,
                data,
                // 移除 Authorization header
                transformRequest: [(data, headers) => {
                    delete headers.Authorization;
                    return JSON.stringify(data);
                }]
            });

            return response.data;
        } catch (error) {
            // 执行自定义错误回调
            if (fallCallBack && typeof fallCallBack === 'function') {
                fallCallBack(error);
            }
            return null;
        } finally {
            // 执行最终回调
            if (onFinalCallBack && typeof onFinalCallBack === 'function') {
                onFinalCallBack();
            }
        }
    },

    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码（明文，会自动 MD5 加密）
     * @returns {Promise} 返回登录结果
     */
    login(username, password) {
        return this.noAuthorizationRequest(
            '/my-login/login-user-by-username-and-password',
            'POST',
            null,
            {
                username,
                password: md5(password)
            }
        );
    },

    /**
     * 获取当前用户信息
     * @returns {Promise} 返回用户信息
     */
    getUserInfo() {
        return this.authorizationRequest('/user/info', 'GET');
    },

    /**
     * 登出
     */
    logout() {
        localStorage.removeItem('token');
        router.push('/login');
        notify.info('已退出登录');
    },

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('token');
    }
};

// 导出实例和通知方法
export default LetoyService;
export { notify };
