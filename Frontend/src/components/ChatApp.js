//ChatApp.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import RoomForm from "./RoomForm";
import MessageList from "./MessageList";
import FileUpload from "./FileUpload";
import Modal from "./Modal";
import "./ChatApp.css";

const ENDPOINT = `${process.env.REACT_APP_Socket_api}`;
const socketOptions = {
  transports: ["websocket"],
  timeout: 250 * 1000, // 250 Seconds
};
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ERROR_MESSAGES = {
  SOCKET_ERROR: "Socket connection error: ",
  DISCONNECT: "disconnected from the server. Attempting to reconnect...",
  EMPTY_MESSAGE: "You must enter a message or select a file.",
  FILE_SIZE_EXCEEDED: (size) => `File size exceeds the ${size} MB limit.`,
  NO_USER_IN_CHATROOM: "No User In Chat Room",
  CONNICTING: "Connecting To Room"
};

export const ChatApp = () => {
  const username = localStorage.getItem("username");
  const FCM_Token = localStorage.getItem("FCM_Token");
  const uid = localStorage.getItem("uid");
  const [room, setRoom] = useState(localStorage.getItem("room") || "");
  const [chat, setChat] = useState([]);
  const [isadmin, setadmin] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [isRoomJoined, setIsRoomJoined] = useState(!!room);
  const [isLoading, setIsLoading] = useState("Send");
  const [isSending, setIsSending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUserlist, setUserlist] = useState();
  const [isConnected,setConnected] = useState(true)
  const [current_sid,setSID] = useState(false)
  const messageRef = useRef();
  const fileInputRef = useRef();
  let socketRef = useRef();
  
  const messagesEndRef = useRef();
  const handleRoom = useRef()
  const navigate = useNavigate();

  const handleConnectError = (err) => {
    setErrorMessage(`${ERROR_MESSAGES.SOCKET_ERROR}${err.message}`);
  };

  const handleDisconnect = () => {
    setErrorMessage(ERROR_MESSAGES.DISCONNECT);
    setIsRoomJoined(false);
    setRoom("");
    localStorage.removeItem("room");
  };

  const handlekick = useCallback((payload) => {
    alert(payload.kick);
    setErrorMessage(payload.kick)
  },[]);

  // Memoizing the handleIncomingMessage function
  const handleIncomingMessage = useCallback((payload) => {
    // console.log("Socket call => ", socketRef.current);
    const timestamp = new Date()
      .toLocaleTimeString("en-IN", {
        hour12: true,
      }).replace(/(am|pm)/i, (match) => match.toUpperCase()); //AM/PM Set In UpperCase 

    setChat((prevChat) => {
      if (payload.users) {
        setUserlist(payload.users);
        // const adminID = ;
      }
      return [...prevChat, { ...payload, timestamp }];
    });
    setIsLoading("Send");
    fileInputRef.current.value = "";
    setIsSending(false);
    if (payload.admin) {
      setadmin(payload.admin)
    }

    if (socketRef.current.connected) {
      setSID(socketRef.current.id)
      setConnected(!socketRef.current.connected)
    };
  }, []); // Add `uid` as a dependency because it's used inside the callback


  const toggleModal = () => {
    setErrorMessage("");
    if (isUserlist) {
      setModalOpen(!modalOpen);
    } else {
      setErrorMessage(ERROR_MESSAGES.NO_USER_IN_CHATROOM);
    }
  };

  // Check if the user is authenticated
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  // Socket connection and event handlers inside useEffect
  useEffect(() => {
    if (isRoomJoined) {
      socketRef.current = io(ENDPOINT+"chat", socketOptions).open(() => {
        console.log("Socket connected, socket.id:", socketRef.current.id);
      });
      socketRef.current.emit("joinRoom", { username, room, FCM_Token, uid });
      socketRef.current.on("connect_error", handleConnectError);
      socketRef.current.on("disconnect", handleDisconnect);
      socketRef.current.on("chat", handleIncomingMessage);
      socketRef.current.on("kick", handlekick);

      return () => {
        socketRef.current.disconnect();
        socketRef.current.off("connect_error", handleConnectError);
        socketRef.current.off("disconnect", handleDisconnect);
        socketRef.current.off("chat", handleIncomingMessage);
      };
    }
  }, [isRoomJoined, room, username, FCM_Token, uid, handlekick, handleIncomingMessage]);

  // Client-side: emit a kickUser event
  const kickUser = (targetSocketId) => {
    socketRef.current.emit("kickUser", targetSocketId,room);
  };

  const joinRoom = (room) => {
    // e.preventDefault();
    if (handleRoom.current.value.trim()||room) {
      localStorage.setItem("room", handleRoom.current.value || room);
      setIsRoomJoined(true);
      setRoom(handleRoom.current.value || room);
      setChat([]);
      setErrorMessage("");
    }
  };

  const leaveRoom = () => {
    let text = `Hay ${username} Do You Really Want To Leave This Room : ${room}`;
    if (window.confirm(text)) {
      setIsRoomJoined(false);
      setRoom("");
      localStorage.removeItem("room");
      localStorage.removeItem("admin");
    }
  };

  const Logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const sendChat = (e) => {
    e.preventDefault();
    const message = messageRef.current.value.trim();
    const file = fileInputRef.current.files[0];

    if (!message && !file) {
      setErrorMessage(ERROR_MESSAGES.EMPTY_MESSAGE);
      return;
    }

    setIsLoading("Sending");
    setIsSending(true);
    setErrorMessage("");
    const data = { message, username, sid:current_sid };

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          ERROR_MESSAGES.FILE_SIZE_EXCEEDED(MAX_FILE_SIZE / 1024 / 1024)
        );
        fileInputRef.current.value = "";
        setIsLoading("Send");
        setIsSending(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        data.file = reader.result;
        data.fileName = file.name;
        data.fileSize = (file.size / 1024 / 1024).toFixed(2);
        socketRef.current.emit("Group", data, handleResponse);
      };
      reader.onerror = () => {
        setErrorMessage("Failed to read file.");
        fileInputRef.current.value = "";
        setIsLoading("Send");
        setIsSending(false);
      };
      reader.readAsDataURL(file);
    } else {
      socketRef.current.emit("Group", data, handleResponse);
    }

    messageRef.current.value = "";
  };

  const handleResponse = (response) => {
    if (response?.error) {
      setErrorMessage(response.error);
    }
    setIsLoading("Send");
    setIsSending(false);
  };

  const renderFileAttachment = (payload) => {
    return <FileUpload payload={payload} />;
  };
  const clearOldMessages = () => {
    setChat([]); // Clears the chat messages
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  return (
    <div className="chat-app">
      <span className="chat-header">
        <h1>Chat Room</h1>

        {!isRoomJoined && <span className="username">{username}</span>}
        {isRoomJoined ? (
          <>
            <button
              className="send-button"
              onClick={toggleModal}
              disabled={isConnected}
            >
              Users List
            </button>
            <Modal
              isOpen={modalOpen}
              onClose={toggleModal}
              kickuser={kickUser}
              userlist={isUserlist}
              current_sid={current_sid}
              admin={isadmin}
            />
          </>
        ) : (
          ""
        )}
        <button className="logout-button" onClick={Logout}>
          Logout
        </button>
      </span>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <br />
      {!isRoomJoined ? (
        <RoomForm
          handleRoom={handleRoom}
          joinRoom={joinRoom}
          socket={{ io, ENDPOINT: `${ENDPOINT}rooms`, socketOptions }}
        />
      ) : (
        <>
          <div
            className="RoomHeader"
            style={{
              pointerEvents: isConnected ? "none" : "auto",
              opacity: isConnected ? 0.5 : 1,
              backgroundColor: isConnected ? "#f0f0f0" : null,
            }}
          >
            <span className="room">
              User: <span className="room-id">{username}</span>
            </span>
            <span className="room">
              Room: <span className="room-id">{room}</span>
            </span>
            <button className="leave-button" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
          <div
            className="chat-messages"
            style={{
              pointerEvents: isConnected ? "none" : "auto",
              opacity: isConnected ? 0.5 : 1,
              backgroundColor: isConnected ? "#f0f0f0" : null,
            }}
          >
            <button onClick={clearOldMessages} className="clear-chat">
              Clear
            </button>
            <MessageList
              current_sid={current_sid}
              chat={chat}
              renderFileAttachment={renderFileAttachment}
              username={username}
            />
            <div ref={messagesEndRef} />
          </div>
          {isConnected && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "red",
                fontweight: "bold",
                zindex: 0,
              }}
            >
              Connecting To Room
            </div>
          )}
          <form
            className="chat-form"
            onSubmit={sendChat}
            style={{
              pointerEvents: isConnected ? "none" : "auto",
              opacity: isConnected ? 0.5 : 1,
              backgroundColor: isConnected ? "#f0f0f0" : null,
            }}
          >
            <input
              type="text"
              name="chat"
              placeholder="Type your message..."
              ref={messageRef}
              className="chat-input"
            />
            <FileUpload fileInputRef={fileInputRef} filesended={isSending} />
            <button type="submit" className="send-button" disabled={isSending}>
              {isLoading}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
