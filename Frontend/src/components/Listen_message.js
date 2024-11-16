// import React, { useEffect, useState } from "react";
// import { database } from "../firebaseConfig";
// import { ref, onValue } from "firebase/database";

// const MessageList = () => {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     const messagesRef = ref(database, "messages");
//     onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val();
//       const messageArray = data
//         ? Object.entries(data).map(([key, value]) => ({
//             id: key,
//             ...value,
//           }))
//         : [];
//       setMessages(messageArray);
//     });
//   }, []);

//   return (
//     <ul>
//       {messages.map((message) => (
//         <li key={message.id}>{message.text}</li>
//       ))}
//     </ul>
//   );
// };

// export default MessageList;
