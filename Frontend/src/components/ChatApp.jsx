// ChatApp.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import RoomForm from "./RoomForm";
import MessageList from "./MessageList";
import FileUpload from "./FileUpload";
import Modal from "./Modal";
import "./ChatApp.css";
import { decrypt, encrypt } from "../Crypoto";

export const Pass = String(process.env.REACT_APP_Pass);

const ENDPOINT = `${process.env.REACT_APP_Socket_api}`;
const socketOptions = {
  transports: ["websocket"],
  reconnectAttempts: 10,
  reconnectDelay: 1000,
  maxBufferSize: 1e9, // 500 MB buffer size
  timeout: 1 * 60 * 1000, // 1 Minute
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  pingTimeout: 2 * 60000, // 2 Minutes
  reconnect: true,
};
let size = 400;
if (window.raj === Pass) {
  size = window.size ? window.size : size;
}
const MAX_FILE_SIZE = size * 1024 * 1024; // 400 MB
const CHUNK_SIZE = 0.8 * 1024 * 1024; // 0.8 MB
let chunks = {};
export const ERROR_MESSAGES = {
  SOCKET_ERROR: "Socket connection error: ",
  DISCONNECT: "disconnected from the server. Attempting to reconnect...",
  EMPTY_MESSAGE: "You must enter a message or select a file.",
  FILE_SIZE_EXCEEDED: (size, name) =>
    `File ${name} size exceeds the ${size} MB limit.`,
  NO_USER_IN_CHATROOM: "No User In Chat Room",
  CONNICTING: "Connecting To Room",
  Login_CONNICTING: "Establishing Connection Please Wait...",
  File_COMMING: (fileName, size) =>
    `Receiving file : ${fileName}, Size : ${size}MB`,
};

export function Replace_Text_With_URL(Obj) {
  const urlRegex =
    /(https?\d*:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;
  Obj.message = Obj.message.replace(urlRegex, (url) => {
    Obj.href = true;
    return `<a href="${url}" target="_blank">${url}</a>`;
  });
  return Obj;
}

const isPrivateUser = new Set();
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
  const [Progressbar, setProgressbar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUserlist, setUserlist] = useState([]); // Array of user objects { name, sid, ... }
  const [isConnected, setConnected] = useState(true);
  const [current_sid, setSID] = useState();
  const [isTyping, setTypingUser] = useState([]);
  const [isPrivate, setPrivatePOP] = useState(false); // Controls mention dropdown visibility
  const messageRef = useRef();
  const fileInputRef = useRef();
  const messagesEndRef = useRef();
  const handleRoom = useRef();
  const navigate = useNavigate();
  let socketRef = useRef();
  const super_id = useRef({});

  // Before unload event: leave the room
  if (room) {
    window.addEventListener("beforeunload", async (event) => {
      const confirmLeave = window.confirm(
        "Are you sure you want to leave this page?"
      );
      if (!confirmLeave) {
        console.log("Reload===>");
        event.preventDefault();
        return false;
      } else {
        socketRef.current.emit("leaveRoom", { username, room, FCM_Token, uid });
      }
    });
  }

  const handleConnectError = (err) => {
    if (window.raj === Pass) console.error("Socket Connection Error =>", err);
    setErrorMessage(`${ERROR_MESSAGES.SOCKET_ERROR}${err.message}`);
  };

  const handleDisconnect = (msg) => {
    if (window.raj === Pass) console.log("Disconnect Error => ", msg);
    setErrorMessage(ERROR_MESSAGES.DISCONNECT);
    setIsRoomJoined(false);
    setRoom("");
    setProgressbar(false);
    localStorage.removeItem("room");
  };

  const handlekick = useCallback((payload) => {
    alert(payload.kick);
    chunks = {};
    if (window.raj === Pass) console.log("Chunks => ", chunks);
    setErrorMessage(payload.kick);
  }, []);

  async function uint8ToBase64(fileChunks, type) {
    const combinedBlob = new Blob(fileChunks, { type: type });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const Base64 = reader.result;
        if (window.raj === Pass) console.log("Base64 => ", Base64);
        resolve(Base64);
      };
      reader.readAsDataURL(combinedBlob);
    });
  }

  const handle_Typing_indicate = useCallback(
    async (array_of_Message) => {
      if (window.raj === Pass) console.log("Typing => ", array_of_Message);
      if (array_of_Message && array_of_Message.length) {
        setTypingUser(array_of_Message);
      }
    },
    [setTypingUser]
  );

  // New mention function: replaces trailing "@" with the selected username.
  const mention = (user) => {
    if (messageRef.current) {
      if (window.raj === Pass) {
        console.log("User private => ", user);
        console.log("List ==>>>> ", isPrivateUser);
      }
      const currentValue = messageRef.current.value;
      isPrivateUser.add(user.sid);
      const newValue = currentValue.replace(/@(\w*)$/, `@${user.name} `);
      messageRef.current.value = newValue;
      setPrivatePOP(false); // Hide the mention dropdown after selection
    }
  };

  // call_typing: check if "@" is present in input and toggle mention dropdown accordingly.
  const call_typing = (e) => {
    const value = e.target.value;
    if (isPrivateUser.size && (!value || !value.includes("@"))) {
      if (window.raj === Pass)
        console.log("Colled ==> Private id Clear", isPrivateUser);
      isPrivateUser.clear();
    }
    if (value.at(-1) === "@") {
      if (!isPrivate) {
        setPrivatePOP(true);
      }
    } else {
      setPrivatePOP(false);
    }
    if (value) {
      socketRef.current.emit("typing");
    }
  };

  const handleIncomingMessage = useCallback(
    async (payload) => {
      if (window.raj === Pass) console.log("Incoming Payload => ", payload);
      const timestamp = new Date()
        .toLocaleTimeString("en-IN", { hour12: true })
        .replace(/(am|pm)/i, (match) => match.toUpperCase());
      if (!payload.system && payload.message) {
        payload.message = await decrypt(payload.message);
      }
      if (payload.file) {
        if (!chunks[payload.sid] && payload.chunkIndex === 0) {
          chunks[payload.sid] = {
            data: [],
            chunk_End: false,
            chunkCount: payload.chunkCount,
          };
        }
        if (chunks[payload.sid]) {
          setProgressbar(true);
          let percentage = Math.floor(
            (payload.chunkIndex / chunks[payload.sid].chunkCount) * 100
          );
          setProgress(percentage);
          setErrorMessage(
            ERROR_MESSAGES.File_COMMING(payload.fileName, payload.fileSize)
          );
          if (payload.chunk_End) {
            chunks[payload.sid].chunk_End = true;
          }
          const Incomming_chunk = payload.file;
          const chunkIndex = payload.chunkIndex;
          chunks[payload.sid].data[chunkIndex] = Incomming_chunk;
          if (payload.chunkIndex === payload.chunkCount - 1) {
            chunks[payload.sid].File_ready = chunks[payload.sid].data.every(
              (element) => element
            );
          }
          if (
            chunks[payload.sid].File_ready === true &&
            chunks[payload.sid].chunk_End === true &&
            chunks[payload.sid].data.length === chunks[payload.sid].chunkCount
          ) {
            const Base64_string = await uint8ToBase64(
              chunks[payload.sid].data,
              payload.Blob_Type
            );
            setChat((prevChat) => {
              if (payload.users) {
                setUserlist(payload.users);
              }
              if (payload.message) {
                payload = Replace_Text_With_URL(payload);
              }
              delete chunks[payload.sid];
              if (payload.sending === super_id.current.id) {
                fileInputRef.current.value = "";
                setIsLoading("Send");
                setIsSending(false);
              }
              return [
                ...prevChat,
                { ...payload, file: Base64_string, timestamp },
              ];
            });
            setErrorMessage("");
            setProgressbar(false);
          }
        }
      } else {
        setChat((prevChat) => {
          if (payload.users) {
            setUserlist(payload.users);
          }
          if (payload.message) {
            payload = Replace_Text_With_URL(payload);
          }
          if (payload.sending === super_id.current.id) {
            fileInputRef.current.value = "";
            setIsLoading("Send");
            setIsSending(false);
          }
          return [...prevChat, { ...payload, timestamp }];
        });
      }
      if (payload.admin) {
        setadmin(payload.admin);
      }
      if (socketRef.current.connected) {
        setSID(socketRef.current.id);
        super_id.current.id = socketRef.current.id;
        setConnected(!socketRef.current.connected);
      }
    },
    [super_id]
  );

  const toggleModal = () => {
    setErrorMessage("");
    if (isUserlist && isUserlist.length > 0) {
      setModalOpen(!modalOpen);
    } else {
      setErrorMessage(ERROR_MESSAGES.NO_USER_IN_CHATROOM);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  try {
    useEffect(() => {
      if (isRoomJoined) {
        socketRef.current = io(ENDPOINT + "chat", socketOptions).open(() => {
          if (window.raj === Pass)
            console.log("Socket connected, socket.id:", socketRef.current.id);
        });
        socketRef.current.emit("joinRoom", { username, room, FCM_Token, uid });
        socketRef.current.on("connect_error", handleConnectError);
        socketRef.current.on("error", handleConnectError);
        socketRef.current.on("disconnect", handleDisconnect);
        socketRef.current.on("chat", handleIncomingMessage);
        socketRef.current.on("typing", handle_Typing_indicate);
        socketRef.current.on("inFile", handleIncomingMessage);
        socketRef.current.on("kick", handlekick);
        socketRef.current.on("pingTimeout", handleConnectError);
        return () => {
          socketRef.current.off("connect_error", handleConnectError);
          socketRef.current.off("error", handleConnectError);
          socketRef.current.off("inFile", handleIncomingMessage);
          socketRef.current.off("disconnect", handleDisconnect);
          socketRef.current.off("chat", handleIncomingMessage);
          socketRef.current.off("pingTimeout", handleConnectError);
        };
      }
    }, [
      isRoomJoined,
      handle_Typing_indicate,
      room,
      username,
      FCM_Token,
      uid,
      handlekick,
      handleIncomingMessage,
    ]);
  } catch (error) {
    if (window.raj === Pass) console.error("Socket Fail => ", error);
  }

  const kickUser = (targetSocketId) => {
    socketRef.current.emit("kickUser", targetSocketId, room);
  };

  const joinRoom = (room) => {
    if (handleRoom.current.value.trim() || room) {
      localStorage.setItem("room", handleRoom.current.value || room);
      setIsRoomJoined(true);
      setRoom(handleRoom.current.value || room);
      setChat([]);
      setErrorMessage("");
    }
  };

  const leaveRoom = () => {
    let text = `Hay ${username.replace(
      " (Demo)",
      ""
    )} Do You Really Want To Leave This Room : ${room}`;
    if (window.confirm(text)) {
      socketRef.current.emit("leaveRoom", { username, room, FCM_Token, uid });
      setIsRoomJoined(false);
      setProgressbar(false);
      setRoom("");
      chunks = {};
      localStorage.removeItem("room");
      localStorage.removeItem("admin");
    }
  };

  const hidemessage = (message_id) => {
    const element = document.getElementById(`ty${message_id}`);
    if (element) {
      element.style.display = "block";
      setTimeout(function () {
        element.style.display = "none";
      }, 5000);
    }
  };

  const Logout = () => {
    let text = `Hay ${username.replace(
      " (Demo)",
      ""
    )} Do You Really Want To Logout!`;
    if (window.confirm(text)) {
      chunks = {};
      localStorage.clear();
      navigate("/");
      socketRef.current.emit("leaveRoom", { username, room, FCM_Token, uid });
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    let limit = 5;
    const privat_M_user = Array.from(isPrivateUser);
    isPrivateUser.clear();
    let message = messageRef.current.value.trim();
    let filelength = fileInputRef.current.files.length;
    if (window.raj === Pass) limit = window.limit ? window.limit : limit;
    if (filelength > limit) {
      alert("You can only select up to 5 files.");
      delete fileInputRef.current.files;
      fileInputRef.current.value = "";
      setIsLoading("Send");
      setIsSending(false);
      filelength = 0;
    }
    if (window.raj === Pass) console.log("File Length => ", filelength);
    if (!message && !filelength) {
      setErrorMessage(ERROR_MESSAGES.EMPTY_MESSAGE);
      return;
    } else {
      if (!isSending) {
        setIsLoading("Sending");
        setIsSending(true);
        setErrorMessage("");
      }
    }
    if (message) {
      message = await encrypt(message);
    }
    const data = { message, username, sid: current_sid, sending: current_sid };
    if (privat_M_user.length) {
      data.sid_array = privat_M_user;
    }
    if (filelength) {
      Array.from(fileInputRef.current.files).forEach((file) => {
        fileSend(file);
      });
    }
    function fileSend(file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(
          ERROR_MESSAGES.FILE_SIZE_EXCEEDED(
            MAX_FILE_SIZE / (1024 * 1024),
            file.name
          )
        );
        fileInputRef.current.value = "";
        setIsLoading("Send");
        setIsSending(false);
        return;
      }
      const reader = new FileReader();
      try {
        reader.onloadend = async () => {
          data.fileName = file.name;
          data.fileSize = (file.size / (1024 * 1024)).toFixed(2);
          const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
          let sendin_Chunk_index = 0;
          async function Chunk_send() {
            const start = sendin_Chunk_index * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            let chunk = file.slice(start, end);
            data.chunkCount = chunkCount;
            data.chunkIndex = sendin_Chunk_index;
            data.chunk_End = sendin_Chunk_index + 1 === chunkCount;
            data.file = chunk;
            if (data.chunk_End) {
              data.Blob_Type = file.type;
            }
            socketRef.current.emit(
              privat_M_user.length ? "privateMessage" : "outFile",
              data
            );
            if (window.raj === Pass)
              console.log(
                `Sent chunk ${sendin_Chunk_index + 1} of ${chunkCount}`
              );
            sendin_Chunk_index++;
            if (sendin_Chunk_index < chunkCount) {
              if (window.raj === Pass) console.log("Sending next chunk...");
              await Chunk_send();
            }
          }
          await Chunk_send();
        };
        reader.onerror = () => {
          setErrorMessage("Failed to read file.");
          fileInputRef.current.value = "";
          setIsLoading("Send");
          setIsSending(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        if (window.raj === Pass) console.log("File Sending Fail => ", err);
      }
    }
    if (!filelength) {
      socketRef.current.emit(
        privat_M_user.length ? "privateMessage" : "Group",
        data
      );
      setIsLoading("Send");
      setIsSending(false);
      messageRef.current.value = "";
    }
  };

  const renderFileAttachment = (payload) => {
    return <FileUpload payload={payload} />;
  };

  const clearOldMessages = () => {
    setChat([]);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // Update dropdownStyle to show mention list under chat input border
  const dropdownStyle = {
    position: "absolute",
    // top: "100%", // positions right below the input field
    // left: "0",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    width: "100%",
    maxHeight: "150px",
    overflowY: "auto",
    listStyle: "none",
    padding: "5px",
    marginTop: "2px",
    zIndex: 1000,
  };

  return (
    <div className="chat-app">
      <span className="chat-header">
        <h1>Chat Room</h1>
        {!isRoomJoined && (
          <span className="username" style={{ marginTop: "5px" }}>
            <span className="room">
              User:{" "}
              <span className="room-id">
                {username ? username.replace(" (Demo)", "") : ""}
              </span>
            </span>
          </span>
        )}
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
      {errorMessage && <span className="error-message">{errorMessage}</span>}
      {Progressbar && (
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}
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
              User:{" "}
              <span className="room-id">
                {username ? username.replace(" (Demo)", "") : ""}
              </span>
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
            {/* <div className="typing-Indicat-box"> */}
            {isTyping.map((message, index) => {
              if (window.raj === Pass) console.log("After Map => ", message);
              hidemessage(index);
              return (
                <span key={index} id={"ty" + index} className="typing-Indicat">
                  {message}
                </span>
              );
            })}
            {/* </div> */}
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
                fontWeight: "bold",
                zIndex: 0,
              }}
            >
              {ERROR_MESSAGES.CONNICTING}
            </div>
          )}
          <form
            className="chat-form"
            onSubmit={sendChat}
            style={{
              pointerEvents: isConnected ? "none" : "auto",
              opacity: isConnected ? 0.5 : 1,
              backgroundColor: isConnected ? "#f0f0f0" : null,
              position: "relative", // ensures dropdown is positioned relative to this container
            }}
          >
            {isPrivate &&
              isUserlist &&
              isUserlist.length > 0 &&
              (isUserlist.some(
                (user) =>
                  user.sid !== current_sid && !isPrivateUser.has(user.sid)
              ) ? (
                <ul className="mention-list" style={dropdownStyle}>
                  {isUserlist
                    .filter(
                      (user) =>
                        user.sid !== current_sid && !isPrivateUser.has(user.sid)
                    )
                    .map((user, index) => (
                      <li
                        key={index}
                        onClick={() => mention(user)}
                        className="mention-item"
                      >
                        {user.name}
                      </li>
                    ))}
                </ul>
              ) : (
                <ul
                  className="mention-list"
                  id="all-selected-message"
                  style={dropdownStyle}
                >
                  <li>All users selected</li>
                </ul>
              ))}

            <input
              type="text"
              name="chat"
              placeholder="Type your message..."
              ref={messageRef}
              onChange={call_typing}
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
