import { getToken } from "firebase/messaging";
import { useEffect } from "react";
import { messaging } from "../firebaseConfig";
import { Pass } from "./ChatApp";

const NotificationHandler = () => {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if(!permission === "granted") console.log("Notification Denied By User");
        if (permission === "granted") { // If Permission Granted Then Cheack FCM Token Availabale Or Not
          if (!localStorage.getItem("FCM_Token")) { // If FCM Token Not Available Then Create FCM Token
            if(window.raj === Pass )console.log("FCM Generating...");
            const token = await getToken(messaging, {
              vapidKey: process.env.REACT_APP_V_api,
            });
            if(window.raj === Pass )console.log("Token", token);
            localStorage.setItem("FCM_Token", token); // FCM Token Set In LocalStorage
          }else{
            if(window.raj === Pass )console.log("FCM Already Available.");
          }
        }
      } catch (error) {
        if(window.raj === Pass )console.log("FCM Generating Failed.");
        if(window.raj === Pass )console.error("Error getting FCM token:", error);
      }
    };

    requestPermission();
  }, []);

  return null; // This component does not render anything
};

export default NotificationHandler;