import React from "react";

const MessageInput = ({
  newMessage,
  handleTyping,
  sendMessage,
  currentRoom,
  socket,
}) => {
  return (
    <form
      onSubmit={sendMessage}
      className="p-3 border-top bg-white d-flex gap-2 shadow-sm"
    >
      <input
        type="text"
        value={newMessage}
        onChange={handleTyping}
        placeholder={`Message #${currentRoom}`}
        className="form-control form-control-lg flex-grow-1"
        maxLength={1000}
        disabled={!socket || !currentRoom}
      />
      <button
        type="submit"
        disabled={!newMessage.trim() || !socket || !currentRoom}
        className="btn btn-primary btn-lg"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
