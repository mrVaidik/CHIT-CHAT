import io from "socket.io-client";
import { SOCKET_URL } from "../config/config";

export const createSocket = (token) => {
  return io(SOCKET_URL, {
    auth: { token },
  });
};

export const setupSocketListeners = (socket, callbacks) => {
  const {
    onConnect,
    onMessage,
    onChatHistory,
    onOnlineUsers,
    onUserJoined,
    onUserLeft,
    onJoinedRoom,
    onUserTyping,
    onError,
  } = callbacks;

  socket.on("connect", onConnect);
  socket.on("message", onMessage);
  socket.on("chatHistory", onChatHistory);
  socket.on("onlineUsers", onOnlineUsers);
  socket.on("userJoined", onUserJoined);
  socket.on("userLeft", onUserLeft);
  socket.on("joinedRoom", onJoinedRoom);
  socket.on("userTyping", onUserTyping);
  socket.on("error", onError);

  return () => {
    socket.disconnect();
  };
};
