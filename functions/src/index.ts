import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// Callable function to send notifications
export const sendSOSNotification = functions.https.onCall(
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Only authenticated users can send notifications"
      );
    }

    const { tokens, title, body, sosId } = data;

    if (
      !tokens ||
      !Array.isArray(tokens) ||
      tokens.length === 0 ||
      !title ||
      !body ||
      !sosId
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields"
      );
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
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send notifications"
      );
    }
  }
);

// Callable function to create the first super admin
export const createSuperAdmin = functions.https.onCall(
  async (
    data: any,
    context: any
  ) => {
    // Only allow if no admin exists
    const adminsSnap = await db.collection("admins").limit(1).get();
    if (!adminsSnap.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "Super admin already exists."
      );
    }

    const { email, password, displayName } = data;
    if (!email || !password || !displayName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields."
      );
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
  }
);