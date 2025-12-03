import api from "@/util/JSLetoyService";

const ServerApi = {
    // 用户登录（普通用户）
    login(username, password, fallCallBack, onFinalCallBack) {
        return api.noAuthorizationRequest(
            "/my-login/login-user-by-username-and-password",
            "POST",
            null,
            {username, password},
            fallCallBack,
            onFinalCallBack)
    },
    // 员工登录（管理员/员工）
    loginStaffByUsernameAndPassword(username, password, fallCallBack, onFinalCallBack) {
        return api.noAuthorizationRequest(
            "/my-login/login-staff-by-username-and-password",
            "POST",
            null,
            {username, password},
            fallCallBack,
            onFinalCallBack)
    },
    // 获取员工信息
    getStaffInfoByUid(fallCallBack, onFinalCallBack) {
        return api.authorizationRequest(
            "/staff-info/get-staff-info-by-uid",
            "GET",
            null,
            {},
            fallCallBack,
            onFinalCallBack)
    },
    UserVerifyInfo: {
        getUserVerifyInfoByCreateTimeAndUserTypeAndStatus(currentPage, pageSize, startDate, endDate, userType, status, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/user-verify-info/get-user-verify-info-by-create-time-and-user-type-and-status",
                "POST",
                null,
                {currentPage, pageSize, startDate, endDate, userType, status}, fallCallBack, onFinalCallBack)
        },
        passUserVerifyInfoByUid(verifyUid, userType, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/user-verify-info/pass-user-verify-info-by-uid",
                "POST",
                null,
                {verifyUid, userType}, fallCallBack, onFinalCallBack)
        },
        failUserVerifyInfoByUid(verifyUid, comment, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/user-verify-info/fail-user-verify-info-by-uid",
                "POST",
                null,
                {verifyUid, comment}, fallCallBack, onFinalCallBack)
        },
        delUserVerifyInfoByUid(targetUid, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/user-verify-info/del-user-verify-info-by-uid",
                "POST",
                null,
                {targetUid}, fallCallBack, onFinalCallBack)
        },
    },
    FlatInfo: {
        getFlatInfoByCreateTimeAndFlatTypeAndStatus(currentPage, pageSize, startDate, endDate, flatType, status, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/flat-info/get-flat-info-by-create-time-and-flat-type-and-status",
                "POST",
                null,
                {currentPage, pageSize, startDate, endDate, flatType, status}, fallCallBack, onFinalCallBack)
        },
        delFlatInfoByFlatId(flatId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/flat-info/del-flat-info-by-flat-id",
                "POST",
                null,
                {flatId}, fallCallBack, onFinalCallBack)
        },
        failFlatInfoByFlatIdAndAdminIdAndComment(flatId,comment, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/flat-info/fail-flat-info-by-flat-id-and-admin-id-and-comment",
                "POST",
                null,
                {flatId,comment}, fallCallBack, onFinalCallBack)
        },
        passFlatInfoByFlatIdAndAdminId(flatId,score, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/flat-info/pass-flat-info-by-flat-id-and-admin-id",
                "POST",
                null,
                {flatId,score}, fallCallBack, onFinalCallBack)
        },
    },
    ApiInfo:{
        getAllApiInfos(currentPage, pageSize,fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/api-info/get-all-api-infos",
                "POST",
                null,
                {currentPage, pageSize,}, fallCallBack, onFinalCallBack)
        },
        updateApiInfoByIdWithApiInfo(apiInfo,fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/api-info/update-api-info-by-id-with-api-info",
                "POST",
                null,
                apiInfo, fallCallBack, onFinalCallBack)
        },
        createApiInfo(apiInfo,fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/api-info/create-api-info",
                "POST",
                null,
                apiInfo, fallCallBack, onFinalCallBack)
        },
    },
    UserInfo:{
        getUserInfosByFuzzyQueryNicknameAndPhoneNumber(nickname,phoneNumber,currentPage, pageSize,fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/user-info/get-user-infos-by-fuzzy-query-nickname-and-phone-number",
                "POST",
                null,
                {nickname,phoneNumber,currentPage, pageSize,}, fallCallBack, onFinalCallBack)
        },
    },
    Shop:{
        getAllShopInfo(fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/shop/get-all-shop-info",
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },
        getShopInfoById(shopId,fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `shop/get-shop-info-by-id/${shopId}`,
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },
    },
    OrderInfo:{
        // 创建菜品订单
        createDishOrder(dishOrder, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/create-dish-order",
                "POST",
                null,
                dishOrder, fallCallBack, onFinalCallBack)
        },

        // 根据订单ID和用户ID获取菜品订单
        getDishOrderByIdAndUid(orderId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/get-dish-order-by-id-and-uid/${orderId}`,
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 根据订单ID获取菜品订单
        getDishOrderById(orderId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/get-dish-order-by-id/${orderId}`,
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 取消订单
        cancelOrder(orderId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/cancel-order/${orderId}`,
                "PUT",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 根据用户ID获取所有菜品订单
        getAllDishOrderByUid(currentPage, pageSize, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/get-all-dish-order-by-uid?currentPage=${currentPage}&pageSize=${pageSize}`,
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 管理员根据商店ID获取所有订单信息
        getAllOrderInfoByShopIdAdminUse(shopId, currentPage, pageSize, statusList = null, beginTime = null, endTime = null, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/get-all-order-info-by-shop-id-admin-use",
                "POST",
                null,
                {shopId, currentPage, pageSize, statusList, beginTime, endTime}, fallCallBack, onFinalCallBack)
        },

        // 员工通过WebSocket获取当天订单信息
        getOrderInfoByEverydayStaffUseWS(fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/get-order-info-by-everyday-staff-use-ws",
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 员工根据商店ID获取所有订单信息
        getAllOrderInfoByShopIdStaffUse(currentPage, pageSize, statusList = null, beginTime = null, endTime = null, orderId = null, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/get-all-order-info-by-shop-id-staff-use",
                "POST",
                null,
                {currentPage, pageSize, statusList, beginTime, endTime, orderId}, fallCallBack, onFinalCallBack)
        },

        // 订单统计
        orderStatistics(fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/order-statistics",
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 取货
        pickup(orderId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/pickup?orderId=${orderId}`,
                "PUT",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 管理员取货
        pickupAdminUse(orderId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/pickup-admin-use?orderId=${orderId}`,
                "PUT",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 今日实时订单统计
        todayRealTimeOrderStatistics(fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/order-info/today-real-time-order-statistics",
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 根据商店获取今日实时订单统计
        todayRealTimeOrderStatisticsByShop(shopId, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                `/order-info/today-real-time-order-statistics-by-shop?shopId=${shopId}`,
                "GET",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 接单 - 生成取餐号
        receiveOrder(orderId, number = null, fallCallBack, onFinalCallBack) {
            const url = number
                ? `/order-info/generate-number?orderId=${orderId}&number=${number}`
                : `/order-info/generate-number?orderId=${orderId}`;
            return api.authorizationRequest(
                url,
                "PUT",
                null,
                {}, fallCallBack, onFinalCallBack)
        },

        // 管理员退款
        refundOrderByAdmin(orderId, reason = null, fallCallBack, onFinalCallBack) {
            return api.authorizationRequest(
                "/wechat-api/refund-by-admin",
                "PUT",
                null,
                {orderId, reason}, fallCallBack, onFinalCallBack)
        },
    }

};
export default ServerApi;
