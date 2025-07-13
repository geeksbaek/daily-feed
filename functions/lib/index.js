"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.unsubscribeFCM = exports.subscribeFCM = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const admin = require("firebase-admin");
// Firebase Admin 초기화
admin.initializeApp();
// 글로벌 옵션 설정 (서울 리전)
(0, v2_1.setGlobalOptions)({ region: "asia-northeast3" });
/**
 * FCM 토픽 구독 함수
 */
exports.subscribeFCM = (0, https_1.onRequest)({
    cors: true,
    invoker: "public",
}, async (request, response) => {
    // CORS 프리플라이트 요청 처리
    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }
    if (request.method !== "POST") {
        response.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { token, topic = "daily-feed" } = request.body;
        if (!token) {
            response.status(400).json({
                success: false,
                error: "FCM 토큰이 필요합니다",
            });
            return;
        }
        // FCM 토픽 구독
        await admin.messaging().subscribeToTopic([token], topic);
        console.log(`FCM 토픽 구독 성공: 토큰=${token.substring(0, 20)}..., 토픽=${topic}`);
        response.json({
            success: true,
            message: `토픽 '${topic}' 구독 완료`,
            topic: topic,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("FCM 토픽 구독 실패:", error);
        response.status(500).json({
            success: false,
            error: "토픽 구독 실패",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
/**
 * FCM 토픽 구독 해제 함수
 */
exports.unsubscribeFCM = (0, https_1.onRequest)({
    cors: true,
    invoker: "public",
}, async (request, response) => {
    // CORS 프리플라이트 요청 처리
    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }
    if (request.method !== "POST") {
        response.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { token, topic = "daily-feed" } = request.body;
        if (!token) {
            response.status(400).json({
                success: false,
                error: "FCM 토큰이 필요합니다",
            });
            return;
        }
        // FCM 토픽 구독 해제
        await admin.messaging().unsubscribeFromTopic([token], topic);
        console.log(`FCM 토픽 구독 해제 성공: 토큰=${token.substring(0, 20)}..., 토픽=${topic}`);
        response.json({
            success: true,
            message: `토픽 '${topic}' 구독 해제 완료`,
            topic: topic,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("FCM 토픽 구독 해제 실패:", error);
        response.status(500).json({
            success: false,
            error: "토픽 구독 해제 실패",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
/**
 * 헬스체크 함수
 */
exports.healthCheck = (0, https_1.onRequest)({
    cors: true,
    invoker: "public",
}, async (request, response) => {
    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }
    response.json({
        status: "healthy",
        service: "daily-feed-functions",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
//# sourceMappingURL=index.js.map