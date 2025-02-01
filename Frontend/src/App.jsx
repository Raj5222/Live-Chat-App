import { Route, Routes} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import { ChatApp, Pass } from "./components/ChatApp";
import Register from "./components/Ragister"
import NotificationHandler from "./components/Notifyhandler";

function App() {
  window.raj = localStorage.getItem("raj")?localStorage.getItem("raj"):window.raj
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
      if(window.raj === Pass )  console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
       if(window.raj === Pass ) console.log("Service Worker registration failed:", error);
      });
  }
  
  fetch(process.env.REACT_APP_Socket_api).then((x)=>{if(window.raj===Pass)console.log("Spcket APi Called => ",x)})
  fetch(process.env.REACT_APP_Server_api).then((x)=>{if(window.raj===Pass)console.log("Server APi Called => ",x)})
  return (
    <>
    <NotificationHandler />
    <Routes>
    <Route path="/chat/*" element={<ChatApp />} />
    <Route path="/ragister" element={<Register />} />
    <Route path="*" element={<Login />} />
    </Routes>
    </>
  );
}

export default App;
