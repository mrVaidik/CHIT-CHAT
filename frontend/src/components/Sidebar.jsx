import React from "react";

const Sidebar = ({
  rooms,
  currentRoom,
  onlineUsers,
  joinRoom,
  setShowCreateRoom,
}) => {
  return (
    <aside
      className="bg-dark text-white p-3 d-flex flex-column overflow-auto shadow-sm"
      style={{ width: "250px" }}
    >
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="h5 mb-0">Rooms</h3>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="btn btn-success btn-sm rounded-circle"
            title="Create Room"
            style={{
              width: "30px",
              height: "30px",
              fontSize: "1.2rem",
              lineHeight: "1",
            }}
          >
            +
          </button>
        </div>

        <div className="list-group">
          {rooms.length === 0 ? (
            <p className="text-muted small">No rooms available. Create one!</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room._id}
                className={`list-group-item list-group-item-action ${
                  currentRoom === room.name ? "active" : "list-group-item-dark"
                }`}
                onClick={() => joinRoom(room.name)}
              >
                <div className="fw-bold">#{room.name}</div>
                {room.description && (
                  <small className="text-muted">{room.description}</small>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {currentRoom && (
        <div className="mt-auto">
          <h3 className="h5 mb-3">Online Users ({onlineUsers.length})</h3>
          <ul className="list-group">
            {onlineUsers.length === 0 ? (
              <p className="text-muted small">No users online.</p>
            ) : (
              onlineUsers.map((username) => (
                <li
                  key={username}
                  className="list-group-item list-group-item-dark d-flex align-items-center"
                >
                  <span
                    className="badge bg-success rounded-circle me-2"
                    style={{ width: "10px", height: "10px" }}
                  ></span>
                  {username}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
