import * as admin from "firebase-admin";
import { config } from "dotenv";

config();

// Initialize Firebase Admin SDK
const serviceAccount = require("../../FCM_Creadential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL,
});



export async function subscribeToTopic(token, topic) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }
    const response = await admin.messaging().subscribeToTopic(token, topic);
    console.log(`Successfully subscribed to ${topic}:`, response);
  } catch (error) {
    console.error(`Error subscribing to ${topic}:`, error);
  }
}

export async function unsubscribeToTopic(token, topic) {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(token, topic);
    console.log(`Successfully unsubscribed to ${topic}:`, response);
  } catch (error) {
    console.error(`Error unsubscribing to ${topic}:`, error);
  }
}

export async function sendMessage(username, topic) {
  const message = {
    notification: {
      title: "New User Joined In ChatRoom",
      body: `New User: ${username} Joined in Room: ${topic}`,
      // icon: "https://raw.githubusercontent.com/Raj5222/Project-Management-System/main/Temp/Icon/Raj-logo.png",
    },
    topic: topic,
  };

  try {
    await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  } catch (err) {
    console.log(`${topic} Msg Sending Error", err`);
  }
}
