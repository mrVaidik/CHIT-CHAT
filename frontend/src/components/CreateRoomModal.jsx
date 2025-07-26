import React from "react";

const CreateRoomModal = ({
  showCreateRoom,
  setShowCreateRoom,
  error,
  isLoading,
  newRoomForm,
  setNewRoomForm,
  handleCreateRoom,
}) => {
  if (!showCreateRoom) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={() => setShowCreateRoom(false)}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4 shadow-lg p-4">
          <div className="modal-header border-bottom-0 pb-3">
            <h3 className="modal-title fs-5 fw-bold text-dark">
              Create New Room
            </h3>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setShowCreateRoom(false)}
            ></button>
          </div>

          {error && (
            <div
              className="alert alert-danger text-center mt-3 mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreateRoom} className="d-grid gap-3 mt-3">
            <input
              type="text"
              placeholder="Room name (e.g., general, gaming)"
              value={newRoomForm.name}
              onChange={(e) =>
                setNewRoomForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
              maxLength={50}
            />
            <textarea
              placeholder="Room description (optional, max 200 characters)"
              value={newRoomForm.description}
              onChange={(e) =>
                setNewRoomForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              maxLength={200}
              rows={3}
            />
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowCreateRoom(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
