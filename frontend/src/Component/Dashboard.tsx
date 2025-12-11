import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface Task {
  id: number;
  title: string;
  due_time: string;
  completed: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Weather {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user");
  const userData: User | null = userStr ? JSON.parse(userStr) : null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("3:00 PM");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [weather, setWeather] = useState<Weather | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load user data and fetch tasks on mount
  useEffect(() => {
    document.body.classList.remove("page-login");
    document.body.classList.remove("page-register");

    if (token) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:4000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        // If the user has no tasks yet, ask the server to ensure defaults exist (atomic)
        if (Array.isArray(data) && data.length === 0) {
          try {
            await fetch("http://localhost:4000/api/tasks/ensure-defaults", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            // re-fetch after server ensured defaults
            const retry = await fetch("http://localhost:4000/api/tasks", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (retry.ok) {
              const newData = await retry.json();
              setTasks(newData);
            }
          } catch (err) {
            console.error("Error ensuring default tasks:", err);
          }
        } else {
          setTasks(data);
        }
      } else {
        console.error("Failed to fetch tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // (server-side ensure-defaults endpoint is used instead of client-side template creation)

  // Add task to backend
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    if (!token) return;

    try {
      const res = await fetch("http://localhost:4000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          dueTime: newTaskTime,
        }),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
        setNewTaskTime("3:00 PM");
      } else {
        alert("Failed to add task");
      }
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Error adding task");
    }
  };

  // Update task on backend
  const handleUpdateTask = async (id: number, newTitle: string) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? updatedTask : task))
        );
        setEditingTaskId(null);
      } else {
        alert("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Error updating task");
    }
  };

  // Delete task from backend
  const handleDeleteTask = async (id: number) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error deleting task");
    }
  };

  // Toggle task completion
  const toggleTask = async (id: number, completed: boolean) => {
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? updatedTask : task))
        );
      }
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFetchWeather = async () => {
    if (!postalCode.trim()) return;
    setLoading(true);
    try {
      // Use wttr.in API - completely free, no API key required
      const weatherRes = await fetch(
        `https://wttr.in/${encodeURIComponent(postalCode)}?format=j1`
      );

      if (!weatherRes.ok) {
        throw new Error("Location not found");
      }

      const weatherData = await weatherRes.json();
      const current = weatherData.current_condition[0];
      const nearestArea = weatherData.nearest_area[0];

      const location = `${nearestArea.areaName[0].value}, ${nearestArea.country[0].value}`;
      const tempC = current.temp_C;
      const tempF = Math.round((tempC * 9) / 5 + 32);

      setWeather({
        temp: tempF,
        condition: current.weatherDesc[0].value,
        location,
        humidity: current.humidity,
        windSpeed: Math.round(current.windspeedKmph * 0.621371), // Convert km/h to mph
      });
    } catch (error) {
      console.error("Weather fetch failed:", error);
      alert("Location not found. Please try a valid postal code or city name (e.g., 10001, London, Paris).");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch timer
  useEffect(() => {
    if (!timerActive) return;
    const timer = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>
            Welcome{userData ? `, ${userData.name}` : ""}!
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Grid */}
      <main className="dashboard-main">
        {/* Left Column */}
        <div className="column-left">
          {/* Tasks Section */}
          <section className="card tasks-card">
            <h2>Tasks & Reminders</h2>
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? "completed" : ""}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id, task.completed)}
                  />
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      className="task-title-edit"
                      value={task.title}
                      onChange={(e) => {
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id ? { ...t, title: e.target.value } : t
                          )
                        );
                      }}
                      onBlur={() => handleUpdateTask(task.id, task.title)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateTask(task.id, task.title);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span
                        className="task-title"
                        onDoubleClick={() => setEditingTaskId(task.id)}
                      >
                        {task.title}
                      </span>
                      <button
                        className="task-delete-btn"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        ×
                      </button>
                    </>
                  )}
                  <span className="task-time">{task.due_time}</span>
                </li>
              ))}
            </ul>
            {/* Add Task Form */}
            <div className="add-task-form">
              <input
                type="text"
                placeholder="Add new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              />
              <input
                type="text"
                placeholder="Time (e.g., 3:00 PM)"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
              />
              <button onClick={handleAddTask}>Add</button>
            </div>
          </section>

          {/* Weather Input */}
          <section className="card weather-input-card">
            <h2>Weather by Location</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleFetchWeather()}
              />
              <button onClick={handleFetchWeather} disabled={loading}>
                {loading ? "Loading..." : "Get Weather"}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="column-right">
          {/* Weather Display */}
          {weather && (
            <section className="card weather-card">
              <h2>{weather.location}</h2>
              <div className="weather-display">
                <div className="temp">{weather.temp}°F</div>
                <div className="condition">{weather.condition}</div>
                <div className="details">
                  <div>💧 Humidity: {weather.humidity}%</div>
                  <div>💨 Wind: {weather.windSpeed} mph</div>
                </div>
              </div>
            </section>
          )}

          {/* Clock */}
          <section className="card clock-card">
            <h2>Current Time</h2>
            <div className="clock-display">{formatTime(time)}</div>
          </section>

          {/* Stopwatch */}
          <section className="card timer-card">
            <h2>Stopwatch</h2>
            <div className="timer-display">{formatTimer(timerSeconds)}</div>
            <div className="timer-controls">
              <button onClick={() => setTimerActive(!timerActive)}>
                {timerActive ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  setTimerSeconds(0);
                }}
              >
                Reset
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
