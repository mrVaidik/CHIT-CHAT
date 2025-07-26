import React from "react";

const RoomHeader = ({ currentRoom, typingUsers, leaveRoom }) => {
  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom shadow-sm">
      <div className="d-flex flex-column">
        <h2 className="h4 mb-0 fw-bold text-dark">#{currentRoom}</h2>
        {typingUsers.length > 0 && (
          <div className="small text-muted fst-italic">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
      </div>
      <button onClick={leaveRoom} className="btn btn-warning">
        Leave Room
      </button>
    </div>
  );
};

export default RoomHeader;
