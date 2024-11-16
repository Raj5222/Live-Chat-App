//MessageList.js
import React from "react";

const MessageList = React.memo(
  ({ current_sid, chat, renderFileAttachment, username}) => {

    //Current_sid is current user sid and userlist in side all user name with sid

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
            {payload.sid !== current_sid && (
              <>
              <strong>
              {payload.username}
                </strong>
                <span className="timestamp">[{payload.timestamp}]</span>:
              </>
            )}
            {payload.message}
            {payload.file && (
              <div className="file-attachment">
                {renderFileAttachment(payload)}
              </div>
            )}
            {payload.sid === current_sid && (
              <>
              <span className="timestamp">:[{payload.timestamp}]:</span>
              <strong> Self</strong>
              </>
            )}
          </div>
        ))}
      </>
    );
  }
);

export default MessageList;
