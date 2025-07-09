"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = exports.sendSOSNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// Callable function to send notifications
exports.sendSOSNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Only authenticated users can send notifications");
    }
    const { tokens, title, body, sosId } = data;
    if (!tokens ||
        !Array.isArray(tokens) ||
        tokens.length === 0 ||
        !title ||
        !body ||
        !sosId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    try {
        const message = {
            notification: { title, body },
            data: { sosId },
            tokens: tokens,
        };
        const response = await admin.messaging().sendEachForMulticast(message);
        return {
            successCount: response.responses.filter(r => r.success).length,
            failureCount: response.responses.filter(r => !r.success).length,
        };
    }
    catch (error) {
        console.error("Error sending notifications:", error);
        throw new functions.https.HttpsError("internal", "Failed to send notifications");
    }
});
// Callable function to create the first super admin
exports.createSuperAdmin = functions.https.onCall(async (data, context) => {
    // Only allow if no admin exists
    const adminsSnap = await db.collection("admins").limit(1).get();
    if (!adminsSnap.empty) {
        throw new functions.https.HttpsError("already-exists", "Super admin already exists.");
    }
    const { email, password, displayName } = data;
    if (!email || !password || !displayName) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
    });
    // Add to admins collection
    await db.collection("admins").doc(userRecord.uid).set({
        email,
        displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: "admin",
        superAdmin: true,
    });
    return { uid: userRecord.uid, email, displayName };
});
//# sourceMappingURL=index.js.map