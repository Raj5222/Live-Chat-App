import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomForm = ({ handleRoom, joinRoom, socket }) => {
  const navigate = useNavigate();

  // Navigate to register page
  const handleRegisterClick = () => {
    navigate("/ragister"); // Fixed typo
  };

  // State to manage room list and modal open state
  const [roomList, setRoomList] = useState([]); // Initialize as an empty array
  const [modelopen, setModelOpen] = useState(false);

  // Toggle modal visibility
  const toggleModal = () => {
    setModelOpen(!modelopen);
  };

  // Effect hook for socket connection and room updates
  useEffect(() => {
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
  }, [socket]);

  // Function to handle room joining
  const join = (room) => {
    handleRoom.current.value = null
    joinRoom(room); // Assuming joinRoom is passed down as a prop
  };

  const uid = localStorage.getItem("uid"); // Getting user id from localStorage

  return (
    <>
      <form onSubmit={joinRoom} className="room-form">
        <input
          type="text"
          placeholder="Create New Room..."
          ref={handleRoom}
          required
          className="room-input"
        />
        <button type="submit" className="join-button">
          Join Room
        </button>
      </form>

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
                <li style={{ color: "red"}}>
                  No Active Room
                </li>
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
