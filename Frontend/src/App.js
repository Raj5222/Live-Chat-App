import { Route, Routes} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import { ChatApp } from "./components/ChatApp";
import Register from "./components/Ragister"
import NotificationHandler from "./components/Notifyhandler";

function App() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  }
  return (
    <>
    <NotificationHandler />
    <Routes>
    <Route path="chat" element={<ChatApp />} />
    <Route path="ragister" element={<Register />} />
    <Route path="*" element={<Login />} />
    </Routes>
    </>
  );
}

export default App;
