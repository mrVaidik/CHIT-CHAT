const API_URL = import.meta.env.VITE_APP_API_URL;

export const fetchRooms = async () => {
  const response = await fetch(`${API_URL}/api/rooms`);
  const data = await response.json();
  return { response, data };
};

export const createRoom = async (roomData, token) => {
  const response = await fetch(`${API_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(roomData),
  });
  const data = await response.json();
  return { response, data };
};
