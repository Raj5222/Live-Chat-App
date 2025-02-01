import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pass } from "./ChatApp";

const RoomForm = ({ handleRoom, joinRoom, socket }) => {
  const navigate = useNavigate();
  // Navigate to register page
  const handleRegisterClick = () => {
    navigate("/ragister"); // Fixed typo
  };

  // State to manage room list and modal open state
  const [roomList, setRoomList] = useState([]); // Initialize as an empty array
  const [modelopen, setModelOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  
  const Room_Name = (e) => {
    setRoomName(e.target.value);
  };

  // Toggle modal visibility
  const toggleModal = () => {
    setModelOpen(!modelopen);
    if (!modelopen && socket) {
      // Emit the "roomlist" event when the modal opens
      if (socket) {
        const connection = socket
          .io(socket.ENDPOINT, socket.socketOptions)
          .open();

        connection.on("connect", () => {
          if (connection.connected) {
            // Request room list
            connection.emit("roomlist");

            connection.on("roomlist", (data) => {
              if (data.rooms) {
                setRoomList(data.rooms);
              }
            });
          }
        });

        return () => {
          if (connection) {
            connection.off("roomlist");
            connection.disconnect();
          }
        };
      }
    }
  };

  // Effect hook for socket connection and room updates
  // useEffect(() => {
  //   if (socket) {
  //     const connection = socket
  //       .io(socket.ENDPOINT, socket.socketOptions)
  //       .open();

  //     connection.on("connect", () => {
  //       if (connection.connected) {
  //         // Request room list
  //         connection.emit("roomlist");

  //         connection.on("roomlist", (data) => {
  //           if (data.rooms) {
  //             setRoomList(data.rooms);
  //           }
  //         });
  //       }
  //     });

  //     return () => {
  //       if (connection) {
  //         connection.off("roomlist");
  //         connection.disconnect();
  //       }
  //     };
  //   }
  // }, [socket]);

  // Function to handle room joining
  const join = (room) => {
    handleRoom.current.value = null;
    if(window.raj === Pass)console.log("Room => ", room);
    joinRoom(room); // Assuming joinRoom is passed down as a prop
  };

  const generateRandomName = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"; // Excludes '0'
    let randomName = chars[Math.floor(Math.random() * (chars.length - 9))]; // First char cannot be '0'

    for (let i = 0; i < Math.floor(Math.random() * 2) + 4; i++) {
      // Ensures 5-6 chars
      randomName += chars[Math.floor(Math.random() * chars.length)];
    }
    // setRoomName(randomName)
    join(randomName);
  };

  const uid = localStorage.getItem("uid"); // Getting user id from localStorage

  return (
    <>
      <form onSubmit={joinRoom} className="room-form">
        <input
          type="text"
          placeholder="Create New Room..."
          ref={handleRoom}
          onChange={Room_Name}
          value={roomName}
          onInvalid={(e) =>
            e.target.setCustomValidity(
              "Room name must be 3-6 letters or numbers, and cannot start with 0."
            )
          }
          onInput={(e) => e.target.setCustomValidity("")} // Reset message on input
          required
          className="room-input"
        />
        <button
          type="submit"
          className="join-button"
          disabled={
            !(
              /^[a-zA-Z1-9][a-zA-Z0-9]{2,5}$/.test(roomName) ||
              roomName === "0206" || roomName === "02062001"
            )
          }
        >
          {roomName.length === 0
            ? "Join Room"
            : /^[a-zA-Z1-9][a-zA-Z0-9]{2,5}$/.test(roomName) ||
              roomName === "0206" || roomName === "02062001"
            ? "Join Room"
            : "Invalid Room"}
        </button>
      </form>
      <button
        type="button"
        onClick={generateRandomName}
        className="join-button"
      >
        🎲 Join Random Room
      </button>
      {/* Show register button only for specific user */}
      {uid === "Raj0001" && (
        <button onClick={handleRegisterClick} className="join-button">
          Register New User
        </button>
      )}

      {/* Modal for room list */}
      {modelopen ? (
        <div className="modal-overlay" aria-hidden="true">
          <div
            className="modal-content"
            role="dialog"
            aria-labelledby="modal-title"
          >
            {roomList.length > 0 ? (
              <>
                <h2 id="modal-title">Active Room List</h2>
                <ul className="user-list-modal">
                  {roomList.map((room, index) => (
                    <li key={index}>
                      <strong>{room}</strong>
                      <span className="kick" onClick={() => join(room)}>
                        ➤
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul className="user-list-modal">
                <li style={{ color: "red" }}>No Active Room</li>
              </ul>
            )}

            <button className="close-button" onClick={toggleModal}>
              Close
            </button>
          </div>
        </div>
      ) : (
        <button onClick={toggleModal} className="join-button">
          Room List
        </button>
      )}
    </>
  );
};

export default RoomForm;
