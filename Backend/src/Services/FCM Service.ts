// import * as express from "express";
// import * as admin from "firebase-admin";

// import { config } from "dotenv";
// config();
// const serviceAccount = require(`${process.env.G_App_Path}`);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// app.post("/send-notification", (req, res) => {
//   const { registrationToken, title, body } = req.body;

//   const message = {
//     notification: {
//       title: title || "New Notification",
//       body: body || "Hello, this is a test notification!",
//     },
//     token: registrationToken,
//   };

//   admin
//     .messaging()
//     .send(message)
//     .then((response) => {
//       console.log("Notification sent:", response);
//       res.status(200).send("Notification sent successfully.");
//     })
//     .catch((error) => {
//       console.error("Error sending notification:", error);
//       res.status(500).send("Error sending notification.");
//     });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
