import React, { useState, useEffect, useRef, useCallback } from "react";
import AuthForms from "./components/AuthForms";
import ChatHeader from "./components/ChatHeader";
import Sidebar from "./components/Sidebar";
import RoomHeader from "./components/RoomHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import CreateRoomModal from "./components/CreateRoomModal";
import {
  validateToken,
  login,
  register,
  guestLogin,
} from "./services/authService";
import { fetchRooms, createRoom } from "./services/roomService";
import { createSocket, setupSocketListeners } from "./services/socketService";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "./utils/utils";

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [currentRoom, setCurrentRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });
  const [guestForm, setGuestForm] = useState({ username: "" });
  const [newRoomForm, setNewRoomForm] = useState({ name: "", description: "" });
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const typingTimeoutRef = useRef(null);

  const fetchRoomsData = useCallback(async () => {
    try {
      const { response, data } = await fetchRooms();
      if (response.ok) {
        setRooms(data);
      } else {
        setError(data.error || "Failed to fetch rooms.");
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      setError("Failed to connect to server to fetch rooms.");
    }
  }, []);

  const validateTokenAndFetchUser = useCallback(async (storedToken) => {
    setIsLoading(true);
    setError("");
    try {
      const { response, data } = await validateToken(storedToken);
      if (response.ok) {
        setUser(data.user);
        setToken(storedToken);
        setActiveTab("chat");
      } else {
        console.error("Token validation failed:", data.error);
        removeStoredToken();
        setToken(null);
        setUser(null);
        setError(data.error || "Session expired. Please log in again.");
        setActiveTab("login");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      removeStoredToken();
      setToken(null);
      setUser(null);
      setError("Could not connect to server to validate session.");
      setActiveTab("login");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { response, data } = await login(loginForm);
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setStoredToken(data.token);
        setActiveTab("chat");
      } else {
        setError(data.error || "Login failed. Please check credentials.");
      }
    } catch (error) {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { response, data } = await register(registerForm);
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setStoredToken(data.token);
        setActiveTab("chat");
      } else {
        setError(data.error || "Registration failed. Username might be taken.");
      }
    } catch (error) {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { response, data } = await guestLogin(guestForm);
      if (response.ok) {
        setUser(data.user);
        setToken(data.token);
        setStoredToken(data.token);
        setActiveTab("chat");
      } else {
        setError(data.error || "Guest login failed.");
      }
    } catch (error) {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    setUser(null);
    setToken(null);
    removeStoredToken();
    setCurrentRoom("");
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setActiveTab("login");
  };

  const joinRoom = (roomName) => {
    if (socket && roomName && user && token) {
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);

      socket.emit("joinRoom", {
        roomName,
        token,
        username: user.username,
      });

      setCurrentRoom(roomName);
    } else {
      setError("Cannot join room: Socket not connected or user not logged in.");
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit("leaveRoom");
      setCurrentRoom("");
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { response, data } = await createRoom(newRoomForm, token);
      if (response.ok) {
        setNewRoomForm({ name: "", description: "" });
        setShowCreateRoom(false);
        fetchRoomsData();
        joinRoom(data.room.name);
      } else {
        setError(data.error || "Failed to create room.");
      }
    } catch (error) {
      setError("Failed to connect to server to create room.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (socket && newMessage.trim() && currentRoom) {
      socket.emit("chatMessage", { content: newMessage.trim() });
      setNewMessage("");

      if (isTyping) {
        socket.emit("typing", { isTyping: false });
        setIsTyping(false);
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && currentRoom && user) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing", { isTyping: true });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", { isTyping: false });
      }, 1000);
    }
  };

  useEffect(() => {
    if (token && !user) {
      validateTokenAndFetchUser(token);
    } else if (!token && !user) {
      setActiveTab("login");
    }
  }, [token, user, validateTokenAndFetchUser]);

  useEffect(() => {
    if (user && token && !socket) {
      const newSocket = createSocket(token);
      setSocket(newSocket);

      const cleanup = setupSocketListeners(newSocket, {
        onConnect: () => console.log("Connected to server"),
        onMessage: (messageData) =>
          setMessages((prev) => [...prev, messageData]),
        onChatHistory: (history) => setMessages(history),
        onOnlineUsers: (users) => setOnlineUsers(users),
        onUserJoined: (data) =>
          setMessages((prev) => [
            ...prev,
            {
              _id: Date.now(),
              content: data.message,
              senderUsername: "System",
              timestamp: new Date(),
              isSystem: true,
            },
          ]),
        onUserLeft: (data) =>
          setMessages((prev) => [
            ...prev,
            {
              _id: Date.now(),
              content: data.message,
              senderUsername: "System",
              timestamp: new Date(),
              isSystem: true,
            },
          ]),
        onJoinedRoom: (data) => setCurrentRoom(data.roomName),
        onUserTyping: (data) => {
          if (data.username !== user.username) {
            setTypingUsers((prev) => {
              if (data.isTyping) {
                return [...new Set([...prev, data.username])];
              } else {
                return prev.filter((u) => u !== data.username);
              }
            });
          }
        },
        onError: (errorData) => {
          setError(errorData.message || "An unknown socket error occurred.");
          if (newSocket) {
            newSocket.disconnect();
            setSocket(null);
          }
        },
      });

      return cleanup;
    } else if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, token]);

  useEffect(() => {
    if (activeTab === "chat" && user) {
      fetchRoomsData();
    }
  }, [activeTab, user, fetchRoomsData]);

  if (activeTab !== "chat") {
    return (
      <AuthForms
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        error={error}
        isLoading={isLoading}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        guestForm={guestForm}
        setGuestForm={setGuestForm}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleGuestLogin={handleGuestLogin}
      />
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <ChatHeader user={user} handleLogout={handleLogout} />

      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar
          rooms={rooms}
          currentRoom={currentRoom}
          onlineUsers={onlineUsers}
          joinRoom={joinRoom}
          setShowCreateRoom={setShowCreateRoom}
        />

        <main className="d-flex flex-column flex-grow-1 bg-white">
          {!currentRoom ? (
            <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-muted p-4">
              <h2 className="display-6 fw-bold mb-3 text-dark">
                Welcome to Chat App!
              </h2>
              <p className="lead">
                Select a room from the sidebar to start chatting.
              </p>
              <p className="text-muted">
                Or click the '+' button to create a new room.
              </p>
            </div>
          ) : (
            <>
              <RoomHeader
                currentRoom={currentRoom}
                typingUsers={typingUsers}
                leaveRoom={leaveRoom}
              />
              <MessageList messages={messages} user={user} />
              <MessageInput
                newMessage={newMessage}
                handleTyping={handleTyping}
                sendMessage={sendMessage}
                currentRoom={currentRoom}
                socket={socket}
              />
            </>
          )}
        </main>
      </div>

      <CreateRoomModal
        showCreateRoom={showCreateRoom}
        setShowCreateRoom={setShowCreateRoom}
        error={error}
        isLoading={isLoading}
        newRoomForm={newRoomForm}
        setNewRoomForm={setNewRoomForm}
        handleCreateRoom={handleCreateRoom}
      />
    </div>
  );
}

export default App;
