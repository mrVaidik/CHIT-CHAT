export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStoredToken = () => localStorage.getItem("token");

export const setStoredToken = (token) => localStorage.setItem("token", token);

export const removeStoredToken = () => localStorage.removeItem("token");
