import { getToken } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../firebaseConfig";

const NotificationHandler = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if(!permission === "granted") console.log("Notification Denied By User");
        if (permission === "granted") { // If Permission Granted Then Cheack FCM Token Availabale Or Not
          if (!localStorage.getItem("FCM_Token")) { // If FCM Token Not Available Then Create FCM Token
            console.log("FCM Generating...");
            const token = await getToken(messaging, {
              vapidKey: process.env.REACT_APP_V_api,
            });
            console.log("Token", token);
            localStorage.setItem("FCM_Token", token); // FCM Token Set In LocalStorage
          }else{
            console.log("FCM Already Available.");
          }
        }
      } catch (error) {
        console.log("FCM Generating Failed.");
        console.error("Error getting FCM token:", error);
      }
    };

    requestPermission();
  }, []);

  return null; // This component does not render anything
};

export default NotificationHandler;