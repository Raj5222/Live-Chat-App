// import React, { useState } from "react";
// import { database } from "../firebaseConfig";
// import { ref, push } from "firebase/database";

// const MessageForm = () => {
//   const [message, setMessage] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const messagesRef = ref(database, "messages");
//     push(messagesRef, { text: message });
//     setMessage("");
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type a message"
//       />
//       <button type="submit">Send</button>
//     </form>
//   );
// };

// export default MessageForm;
