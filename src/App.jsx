import { useEffect, useState } from "react";
import "./App.css";


import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import {
  login,
  register,
  verifyOTP,
  getTasks,
  createTask as CreateTaskAPI,
  updateTask,
  deleteTask as deleteTaskAPI,
} from "./services/api";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


function App() {

  // ==========================================
  // AUTH STATE
  // ==========================================

  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("access_token")
  );

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // OTP registration
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");

  // ==========================================
  // TASK STATE
  // ==========================================

  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");

  const [taskLoading, setTaskLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);

  const [editTitle, setEditTitle] = useState("");


  // ==========================================
  // GET TASKS
  // ==========================================

  const fetchTasks = async () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      setTasks(data);

    } catch (error) {

      console.error(error);

    }
  };


  // ==========================================
  // LOAD TASKS
  // ==========================================

  useEffect(() => {

    if (isLoggedIn) {
      fetchTasks();
    }

  }, [isLoggedIn]);


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (
    loginUsername,
    loginPassword
  ) => {

    setMessage("");

    try {

      // API service se login request
      const data = await login(
        loginUsername,
        loginPassword
      );

      // JWT token save
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Username save
      localStorage.setItem(
        "username",
        loginUsername
      );

      setUsername(loginUsername);
      setPassword("");

      // Dashboard open
      setIsLoggedIn(true);

    } catch (error) {

      throw error;

    }
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (username, email, password) => {
    try {
      await register(username, email, password);

      setShowOTP(true);
    } catch (error) {
      alert(error.message);
    }
  };
  // ==========================================
  // OTP VERIFICATION label
  // ==========================================
  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async () => {
    setOtpLoading(true);

    try {
      await verifyOTP(username, otp);

      alert("OTP verified successfully!");

      setShowOTP(false);
      setOtp("");
      setPassword("");
      setEmail("");
      setIsLogin(true);

    } catch (error) {
      alert(error.message);
    } finally {
      setOtpLoading(false);
    }
  };


  // ==========================================
  // CREATE TASK
  // ==========================================

  const createTask = async (event) => {

    event.preventDefault();

    if (!newTask.trim()) {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    setTaskLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/tasks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: newTask,
            completed: false,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {

        alert(
          data.detail ||
          "Could not create task"
        );

        return;
      }

      setTasks((oldTasks) => [
        data,
        ...oldTasks,
      ]);

      setNewTask("");

    } catch (error) {

      alert(
        "Cannot connect to backend."
      );

    } finally {

      setTaskLoading(false);

    }
  };


  // ==========================================
  // UPDATE TASK
  // ==========================================

  const toggleTask = async (task) => {

    const token =
      localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `${API_URL}/tasks/${task.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: task.title,
            completed: !task.completed,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const updatedTask =
        await response.json();

      if (!response.ok) {

        alert(
          updatedTask.detail ||
          "Could not update task"
        );

        return;
      }

      setTasks((oldTasks) =>
        oldTasks.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item
        )
      );

    } catch (error) {

      alert(
        "Cannot connect to backend."
      );

    }
  };


  // ==========================================
  // START EDIT
  // ==========================================

  const startEdit = (task) => {

    setEditingId(task.id);

    setEditTitle(task.title);

  };


  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const cancelEdit = () => {

    setEditingId(null);

    setEditTitle("");

  };


  // ==========================================
  // SAVE EDIT
  // ==========================================

  const saveEdit = async (task) => {

    if (!editTitle.trim()) {
      return;
    }

    const token =
      localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `${API_URL}/tasks/${task.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            title: editTitle,
            completed: task.completed,
          }),
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const updatedTask =
        await response.json();

      if (!response.ok) {

        alert(
          updatedTask.detail ||
          "Could not update task"
        );

        return;
      }

      setTasks((oldTasks) =>
        oldTasks.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item
        )
      );

      cancelEdit();

    } catch (error) {

      alert(
        "Cannot connect to backend."
      );

    }
  };


  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (taskId) => {

    const token =
      localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {

        const data =
          await response.json();

        alert(
          data.detail ||
          "Could not delete task"
        );

        return;
      }

      setTasks((oldTasks) =>
        oldTasks.filter(
          (task) =>
            task.id !== taskId
        )
      );

    } catch (error) {

      alert(
        "Cannot connect to backend."
      );

    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "username"
    );

    setIsLoggedIn(false);

    setTasks([]);

    setUsername("");

    setPassword("");

  };


  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredTasks = tasks.filter(
    (task) => {

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =
        filter === "all" ||
        (
          filter === "completed" &&
          task.completed
        ) ||
        (
          filter === "pending" &&
          !task.completed
        );

      return (
        matchesSearch &&
        matchesFilter
      );

    }
  );


  // ==========================================
  // DASHBOARD
  // ==========================================

  if (isLoggedIn) {

    const completedTasks =
      tasks.filter(
        (task) =>
          task.completed
      ).length;

    return (
      <ProtectedRoute>

      <div className="dashboard-page">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <div className="brand">
              ✓ TaskFlow
            </div>

            <p>
              Manage your tasks easily
            </p>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </header>


        {/* MAIN */}

        <main className="dashboard-container">

          {/* WELCOME */}

          <section className="welcome-section">

            <div>

              <h1>
                Good morning, {username || "there"}{" "}
                <span className="greeting-emoji">👋</span>
              </h1>

              <p>
                Stay organized and get
                things done.
              </p>

            </div>

          </section>


          {/* STATS */}

          <section className="stats">

            <div className="stat-card">

              <span className="stat-number">
                {tasks.length}
              </span>

              <span className="stat-label">
                Total Tasks
              </span>

            </div>


            <div className="stat-card">

              <span className="stat-number">
                {completedTasks}
              </span>

              <span className="stat-label">
                Completed
              </span>

            </div>


            <div className="stat-card">

              <span className="stat-number">
                {tasks.length -
                  completedTasks}
              </span>

              <span className="stat-label">
                Pending
              </span>

            </div>

          </section>


          {/* TASK PANEL */}

          <section className="task-panel">

            <div className="panel-header">

              <div>

                <h2>
                  My Tasks
                </h2>

                <p>
                  Create and manage your tasks
                </p>

              </div>

            </div>


            {/* ADD TASK */}

            <form
              className="add-task"
              onSubmit={createTask}
            >

              <input
                type="text"
                placeholder="What do you need to do?"
                value={newTask}
                onChange={(event) =>
                  setNewTask(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
                disabled={taskLoading}
              >
                {taskLoading
                  ? "Adding..."
                  : "+ Add Task"}
              </button>

            </form>


            {/* SEARCH + FILTER */}

            <div className="task-tools">

              <div className="search-box">

                <span>
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="filter-buttons">

                <button
                  type="button"
                  className={
                    filter === "all"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("all")
                  }
                >
                  All
                </button>


                <button
                  type="button"
                  className={
                    filter === "pending"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("pending")
                  }
                >
                  Pending
                </button>


                <button
                  type="button"
                  className={
                    filter === "completed"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter("completed")
                  }
                >
                  Completed
                </button>

              </div>

            </div>


            {/* TASK LIST */}

            <div className="task-list">

              {filteredTasks.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    ✓
                  </div>

                  <h3>
                    No matching tasks
                  </h3>

                  <p>
                    Try another search
                    or filter.
                  </p>

                </div>

              ) : (

                filteredTasks.map(
                  (task) => (

                    <div
                      className={
                        task.completed
                          ? "task completed"
                          : "task"
                      }
                      key={task.id}
                    >

                      <button
                        className="check-button"
                        onClick={() =>
                          toggleTask(task)
                        }
                      >
                        {task.completed
                          ? "✓"
                          : ""}
                      </button>


                      {editingId === task.id ? (

                        <input
                          className="edit-input"
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(
                              event.target.value
                            )
                          }
                          autoFocus
                        />

                      ) : (

                        <span className="task-title">
                          {task.title}
                        </span>

                      )}


                      {editingId === task.id ? (

                        <>

                          <button
                            className="save-button"
                            onClick={() =>
                              saveEdit(task)
                            }
                          >
                            Save
                          </button>


                          <button
                            className="cancel-button"
                            onClick={
                              cancelEdit
                            }
                          >
                            Cancel
                          </button>

                        </>

                      ) : (

                        <>

                          <button
                            className="edit-button"
                            onClick={() =>
                              startEdit(task)
                            }
                          >
                            Edit
                          </button>


                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteTask(task.id)
                            }
                          >
                            Delete
                          </button>

                        </>

                      )}

                    </div>

                  )
                )

              )}

            </div>

          </section>

        </main>

      </div>
      </ProtectedRoute>

    );
  }


  // ==========================================
  // PREMIUM LOGIN
  // ==========================================

  if (isLogin) {

    return (

      <Login

        onLogin={handleLogin}

        onShowRegister={() => {
          setIsLogin(false);
          setMessage("");
        }}

      />

    );

  }


  // ==========================================
  // PREMIUM REGISTER
  // ==========================================

  return (
    <div className="auth-page">
      <div className="auth-background"></div>

      <div className="auth-card">

        <div className="auth-logo">
          ✓
        </div>

        {showOTP ? (
          <>
            <h1>Verify your account</h1>

            <p className="auth-subtitle">
              Enter the 6-digit OTP shown in the backend terminal
            </p>

            <div className="input-group">
              <label>OTP</label>

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                maxLength={6}
              />
            </div>
            <button
              className="auth-button"
              type="button"
              onClick={handleVerifyOTP}
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? "Verifying..." : "Verify OTP →"}
            </button>
          </>
        ) : (
          <>
            <h1>
              Create account
            </h1>

            <p className="auth-subtitle">
              Start organizing your tasks today
            </p>

            {message && (
              <div className="error-message">
                {message}
              </div>
            )}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleRegister(username, email, password);
              }}
            >

              <div className="input-group">
                <label>Username</label>

                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Email</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account →"}
              </button>

            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="register-text">
              Already have an account?

              <button
                type="button"
                className="register-link"
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}


export default App;