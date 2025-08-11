const functions = require("firebase-functions");
const axios = require("axios");

// ✅ Replace with your actual Fast2SMS API key
const FAST2SMS_API_KEY = "AbfKxsrev1hUX58GYdmuo7J9DOnyBtiqVlpwcgMLNQHPj6aE4Z43r6H8DVKRqOyfJWYjh7nLPalobFcg";

exports.sendBookingSMS = functions.https.onCall(async (data, context) => {
  const { phoneNumber, message } = data;

  if (!phoneNumber || !message) {
    throw new functions.https.HttpsError("invalid-argument", "Phone or message missing.");
  }

  try {
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: phoneNumber,
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
        },
      }
    );

    return { success: true };
  } catch (err) {
    console.error("🔥 SMS Error:", err.message);
    throw new functions.https.HttpsError("internal", "Failed to send SMS.");
  }
});
