import React from "react";

const AuthForms = ({
  activeTab,
  setActiveTab,
  error,
  isLoading,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  guestForm,
  setGuestForm,
  handleLogin,
  handleRegister,
  handleGuestLogin,
}) => {
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-primary p-4">
      <div
        className="card shadow-lg p-4 p-md-5 w-100"
        style={{ maxWidth: "480px", borderRadius: "1rem" }}
      >
        <h1 className="text-center mb-4 text-dark fw-bold">CHIT-CHAT</h1>

        <ul className="nav nav-tabs nav-justified mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "guest" ? "active" : ""}`}
              onClick={() => setActiveTab("guest")}
            >
              Guest
            </button>
          </li>
        </ul>

        {error && (
          <div className="alert alert-danger text-center mb-4" role="alert">
            {error}
          </div>
        )}

        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="d-grid gap-3">
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="d-grid gap-3">
            <input
              type="text"
              placeholder="Username (3-20 characters)"
              value={registerForm.username}
              onChange={(e) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
              minLength={3}
              maxLength={20}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>
          </form>
        )}

        {activeTab === "guest" && (
          <form onSubmit={handleGuestLogin} className="d-grid gap-3">
            <input
              type="text"
              placeholder="Guest Username"
              value={guestForm.username}
              onChange={(e) =>
                setGuestForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="form-control form-control-lg"
              required
              minLength={3}
              maxLength={20}
            />
            <button
              type="submit"
              className="btn btn-info btn-lg text-white"
              disabled={isLoading}
            >
              {isLoading ? "Joining as guest..." : "Join as Guest"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthForms;
