import React from "react";

const ChatHeader = ({ user, handleLogout }) => {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm p-3">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <h1 className="navbar-brand mb-0 h1">CHIT-CHAT</h1>
        </div>
        <div className="d-flex align-items-center">
          <span className="navbar-text me-3 fs-5 text-white-50">
            {user?.username} {user?.isGuest && "(Guest)"}
          </span>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
