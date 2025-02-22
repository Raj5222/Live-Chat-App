//MessageList.js
import React, { useState } from "react";
import "./MessageList.css";
// const [copySuccess, setCopySuccess] = useState({});


const MessageList = React.memo(
  ({ current_sid, chat, renderFileAttachment, username }) => {
    //Current_sid is current user sid and userlist in side all user name with sid
    const [buttonStates, setButtonStates] = useState({});
    const copyToClipboard = (message,id) => {
      if (message) {
        navigator.clipboard
        .writeText(message)
        .then(() => {
            setButtonStates((prevStates) => ({ ...prevStates, [id]: true }));
            setTimeout(() => {
              setButtonStates((prevStates) => ({ ...prevStates, [id]: false }));
            }, 2000);
          // console.log("Copy Complete");
        })
        .catch(() => {
          console.log("Copy Fail");
        });
      }
    };
    return (
      <>
        {chat.map((payload, index) => (
          <div
            key={index}
            className={`message ${
              payload.sid === current_sid
                ? "my-message"
                : !payload.username
                ? "system-message"
                : ""
            }`}
          >
            {(payload.message && payload.username && !payload.href) && (<button className={payload.sid === current_sid?"CopyButton Selfcopybtn":"CopyButton"} onClick={() => copyToClipboard(payload.message,index)}> {buttonStates[index] ? 'Copied!' : 'Copy Content'}</button>)}
            {payload.sid !== current_sid && (
              <>
                <strong>{payload.username}{payload.sid_array?'🔒':""}</strong>
                <span className="timestamp">[{payload.timestamp}]</span>:
              </>
            )}
            <>
              {payload.message && payload.href ? (
                <span
                  key={payload.message}
                  dangerouslySetInnerHTML={{ __html: payload.message }}
                />
              ) : payload.message}
            </>
            {payload.file && (
              <div className="file-attachment">
                {renderFileAttachment(payload)}
              </div>
            )}
            {payload.sid === current_sid && (
              <>
                <span className="timestamp">:[{payload.timestamp}]:</span>
                <strong>{payload.sid_array?'🔒':""} Self</strong>
              </>
            )}
          </div>
        ))}
      </>
    );
  }
);

export default MessageList;
