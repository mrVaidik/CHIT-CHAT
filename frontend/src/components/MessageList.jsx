import React, { useRef, useEffect } from "react";
import { formatTime } from "../utils/utils";

const MessageList = ({ messages, user }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className="flex-grow-1 overflow-auto p-3 bg-light"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {messages.length === 0 ? (
        <div className="text-center text-muted fst-italic p-3">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message._id}
            className={`d-flex mb-2 ${
              message.isSystem
                ? "justify-content-center"
                : message.senderUsername === user?.username
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-3 rounded-3 shadow-sm ${
                message.isSystem
                  ? "bg-info-subtle text-info text-center fst-italic"
                  : message.senderUsername === user?.username
                  ? "bg-primary text-white"
                  : "bg-light text-dark border"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {!message.isSystem && (
                <div
                  className={`d-flex mb-1 small ${
                    message.senderUsername === user?.username
                      ? "justify-content-end text-white-50"
                      : "justify-content-between text-muted"
                  }`}
                >
                  <span className="fw-bold me-2">
                    {message.senderUsername}
                    {message.isGuest && " (Guest)"}
                  </span>
                  <span className="opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
              <div className="text-break">{message.content}</div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
