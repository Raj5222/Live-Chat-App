//ChatApp.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import RoomForm from "./RoomForm";
import MessageList from "./MessageList";
import FileUpload from "./FileUpload";
import Modal from "./Modal";
import "./ChatApp.css";
import { decrypt, encrypt} from "../Crypoto";
export const Pass = String(process.env.REACT_APP_Pass);

const ENDPOINT = `${process.env.REACT_APP_Socket_api}`;
const socketOptions = {
  transports: ["websocket"],
  maxBufferSize: 1e9, // 500 MB buffer size
  timeout: 1 * 60 * 1000, // 1 Minutes
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  pingTimeout: 2 * 60000, // 2 Minutes
};
const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400 MB
const CHUNK_SIZE = 0.8 * 1024 * 1024; //0.8 MB
let chunks = {};
// const CHUNK_SIZE = (1 * 1024 * 1024); // 1 MB Chunk
export const ERROR_MESSAGES = {
  SOCKET_ERROR: "Socket connection error: ",
  DISCONNECT: "disconnected from the server. Attempting to reconnect...",
  EMPTY_MESSAGE: "You must enter a message or select a file.",
  FILE_SIZE_EXCEEDED: (size) => `File size exceeds the ${size} MB limit.`,
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
  // console.log("URL=> ",urls)
  return Obj;
}

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
  const [isUserlist, setUserlist] = useState();
  const [isConnected, setConnected] = useState(true);
  const [current_sid, setSID] = useState(false);
  const messageRef = useRef();
  const fileInputRef = useRef();
  let socketRef = useRef();

  if (room) {
    window.addEventListener("beforeunload", (event) => {
      if (!window.confirm("Hello")) {
        event.preventDefault();
        return false; // Prevent reload
      }
    });
  }

  const messagesEndRef = useRef();
  const handleRoom = useRef();
  const navigate = useNavigate();

  const handleConnectError = (err) => {
    if (window.raj === Pass) console.error("Socket Connection Error =>", err);
    setErrorMessage(`${ERROR_MESSAGES.SOCKET_ERROR}${err.message}`);
  };

  // const handleResponse = (response) => {
  //   console.log("Handle Responce => ", response);
  //   if (response?.error) {
  //     setErrorMessage(response.error);
  //   }
  //   setIsLoading("Send");
  //   setIsSending(false);
  // };

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
    chunks = {}
    if(window.raj === Pass) console.log("Chunks => ",chunks)
    setErrorMessage(payload.kick);
  }, []);

  async function uint8ToBase64(fileChunks, type) {
    const combinedBlob = new Blob(fileChunks, { type: type });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const Base64 = reader.result; // Strip the data URL prefix
        if (window.raj === Pass) console.log("Base64 => ", Base64);
        resolve(Base64);
      };
      reader.readAsDataURL(combinedBlob);
    });
  }

  const handleIncomingMessage = useCallback(async (payload) => {
    if (window.raj === Pass) console.log("Incomig Payload => ", payload);
    // console.log("Socket call => ", socketRef.current);
    const timestamp = new Date()
      .toLocaleTimeString("en-IN", {
        hour12: true,
      })
      .replace(/(am|pm)/i, (match) => match.toUpperCase()); //AM/PM Set In UpperCase

      if(payload.format === true){
        if(payload.message){
          payload.message = await decrypt(payload.message)
        }

        // if(payload.file){
        //   payload.file = await decryptChunk(payload.file)
        // }
      }
      // conso
    if (payload.file) {
      // Chunked file received
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

        // Store the chunk
        if (window.raj === Pass)
          console.log(
            "Index ==> ",
            chunkIndex,
            " of ",
            chunks[payload.sid].chunkCount
          );
        chunks[payload.sid].data[chunkIndex] = Incomming_chunk;

        // Check if all chunks have been received
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
          // if(payload.Blob_Type){
          const Base64_string = await uint8ToBase64(
            chunks[payload.sid].data,
            payload.Blob_Type
          );

          // Combine the chunks

          // console.log("Combined file => ", Base64_string);

          // Update the chat state with the combined file
          setChat((prevChat) => {
            if (payload.users) {
              setUserlist(payload.users);
              // const adminID = ;
            }
            if (payload.message) {
              payload = Replace_Text_With_URL(payload);
            }
            delete chunks[payload.sid];
            if (window.raj === Pass) console.log("After Delete => ", chunks);
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
          // const adminID = ;
        }
        if (payload.message) {
          payload = Replace_Text_With_URL(payload);
        }
        return [...prevChat, { ...payload, timestamp }];
      });
    }

    setIsLoading("Send");
    fileInputRef.current.value = "";
    setIsSending(false);
    if (payload.admin) {
      setadmin(payload.admin);
    }

    if (socketRef.current.connected) {
      setSID(socketRef.current.id);
      setConnected(!socketRef.current.connected);
    }
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

  try {
    // Socket connection and event handlers inside useEffect
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
        socketRef.current.on("kick", handlekick);
        socketRef.current.on("pingTimeout", handleConnectError);
        return () => {
          socketRef.current.disconnect();
          socketRef.current.off("connect_error", handleConnectError);
          socketRef.current.off("error", handleConnectError);
          socketRef.current.off("disconnect", handleDisconnect);
          socketRef.current.off("chat", handleIncomingMessage);
          socketRef.current.off("pingTimeout", handleConnectError);
        };
      }
    }, [
      isRoomJoined,
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
  // Client-side: emit a kickUser event
  const kickUser = (targetSocketId) => {
    socketRef.current.emit("kickUser", targetSocketId, room);
  };

  const joinRoom = (room) => {
    // e.preventDefault();
    if (handleRoom.current.value.trim() || room) {
      localStorage.setItem("room", handleRoom.current.value || room);
      setIsRoomJoined(true);
      setRoom(handleRoom.current.value || room);
      setChat([]);
      setErrorMessage("");
    }
  };

  const leaveRoom = () => {
    let text = `Hay ${username.replace(" (Demo)","")} Do You Really Want To Leave This Room : ${room}`;
    if (window.confirm(text)) {
      setIsRoomJoined(false);
      setProgressbar(false);
      setRoom("");
      chunks = {};
      localStorage.removeItem("room");
      localStorage.removeItem("admin");
    }
  };

  const Logout = () => {
    let text = `Hay ${username.replace(" (Demo)","")} Do You Really Want To Logout!`;
    if (window.confirm(text)) {
      chunks = {};
      localStorage.clear();
      navigate("/");
    }
  };

  const sendChat = async(e) => {
    e.preventDefault();
    let message = messageRef.current.value.trim();
    const file = fileInputRef.current.files[0];

    if (!message && !file) {
      setErrorMessage(ERROR_MESSAGES.EMPTY_MESSAGE);
      return;
    }

    setIsLoading("Sending");
    setIsSending(true);
    setErrorMessage("");
    if(message){
      message = await encrypt(message)
    }
    const data = { message, username, sid: current_sid,format:true};

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
      try {
        reader.onloadend = async () => {
          // data.file = reader.result;
          // console.log("Test => ",data.file)
          data.fileName = file.name;
          data.fileSize = (file.size / 1024 / 1024).toFixed(2);
          const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
          let sendin_Chunk_index = 0;

          async function Chunk_send() {
            const start = sendin_Chunk_index * CHUNK_SIZE; // Start byte of the chunk
            const end = Math.min(start + CHUNK_SIZE, file.size); // End byte of the chunk
            let chunk = await file.slice(start, end); // Slice the file to get the chunk

            // Prepare data to send
            console.log("E Chunks => ",chunk)
            // chunk = await encryptChunk(chunk)
            // data.fileName = file.name, // Original file name
            data.chunkCount = chunkCount; // Total number of chunks
            data.chunkIndex = sendin_Chunk_index; // Current chunk index
            data.chunk_End = sendin_Chunk_index + 1 === chunkCount; // Indicator for the last chunk
            data.file = chunk; // Current chunk of the file
            // data.format = true; Use For Enc..
            if (data.chunk_End) {
              data.Blob_Type = file.type;
            }

            // Emit the chunk via WebSocket
            socketRef.current.emit("Group", data); // Sending Message And File Local To Server to Client

            // Log progress
            if (window.raj === Pass)
              console.log(
                `Sent chunk ${sendin_Chunk_index + 1} of ${chunkCount}`
              );
            sendin_Chunk_index++;
            if (sendin_Chunk_index < chunkCount) {
              if (window.raj === Pass)
                console.log("Re call For Sending New Chunk");
              await Chunk_send();
            } else {
              fileInputRef.current.value = "";
              setIsLoading("Send");
              setIsSending(false);
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
    } else {
      socketRef.current.emit("Group", data); // Sending Message Local To Server to Client
    }

    messageRef.current.value = "";
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
        {!isRoomJoined && (
          <span className="username" style={{marginTop:"5px"}}>
            <span className="room">
              User: <span className="room-id">{username.replace(" (Demo)","")}</span>
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
              User: <span className="room-id">{username.replace(" (Demo)","")}</span>
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
              {ERROR_MESSAGES.CONNICTING}{" "}
              {/*<<=== Message Show For Connection Phase */}
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
