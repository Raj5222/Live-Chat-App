// Modal.js
import React, { useEffect, useRef } from "react";
import "./Modal.css"; 

const Modal = ({ isOpen, onClose, userlist, kickuser, admin, current_sid }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (!userlist) return null;

  return (
    <div className="modal-overlay" aria-hidden="true">
      <div
        className="modal-content"
        role="dialog"
        aria-labelledby="modal-title"
        ref={modalRef}
      >
        <h2 id="modal-title">Users in Room</h2>
        <ul className="user-list-modal">
          {userlist.map((user, index) => {
            return (
              <li
                key={user.sid}
                className={
                  user.sid === admin.sid ? "admin-user" : "general-user"
                }
              >
                {user.sid === admin.sid
                  ? `${++index}. ${user.name} ${
                      current_sid === user.sid ? "(Self)" : ""
                    } - Admin`
                  : `${++index}. ${user.name} ${
                      current_sid === user.sid ? "(Self)" : ""
                    }`}

                {/* Only the admin can kick users */}
                {current_sid === admin.sid && user.sid !== current_sid && (
                  <span className="kick" onClick={() =>{if(window.confirm(`Do You Really Want To Kick ${(user.name).replace(" (Demo)","")}!`))kickuser(user.sid)}}>
                    ⛔
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};


export default Modal;
