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
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("3:00 PM");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [weather, setWeather] = useState<Weather | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const token = localStorage.getItem("accessToken");

  // Load user data and fetch tasks on mount
  useEffect(() => {
    document.body.classList.remove("page-login");
    document.body.classList.remove("page-register");

    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    // Fetch tasks from backend
    fetchTasks();
  }, [token]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!timerActive) return;
    const timer = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFetchWeather = async () => {
    if (!postalCode.trim()) return;
    setLoading(true);
    try {
      // Use Open-Meteo Geocoding API with country filter for better results
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?query=${encodeURIComponent(postalCode)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("Location not found. Please try another postal code or city name.");
        setLoading(false);
        return;
      }

      const result = geoData.results[0];
      const { latitude, longitude, name, admin1, country } = result;

      // Fetch weather using Open-Meteo Weather API
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      // Map weather codes to conditions
      const conditionMap: Record<number, string> = {
        0: "Clear",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Cloudy",
        45: "Foggy",
        48: "Foggy",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        61: "Light Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Light Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        80: "Light Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Light Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Thunderstorm with Hail",
      };

      const condition = conditionMap[current.weather_code] || "Unknown";

      setWeather({
        temp: Math.round(current.temperature_2m),
        condition,
        location: `${name}, ${admin1 || country}`,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
      });
    } catch (error) {
      console.error("Weather fetch failed:", error);
      alert("Failed to fetch weather. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: newTaskTitle,
      dueTime: newTaskTime,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskTime("3:00 PM");
  };

  const handleUpdateTask = (id: number, newTitle: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title: newTitle } : task))
    );
    setEditingTaskId(null);
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>Welcome{user ? `, ${user.email}` : ""}!</p>
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
                    onChange={() => toggleTask(task.id)}
                  />
                  {editingTaskId === task.id ? (
                    <input
                      type="text"
                      className="task-title-edit"
                      value={task.title}
                      onChange={(e) =>
                        handleUpdateTask(task.id, e.target.value)
                      }
                      onBlur={() => setEditingTaskId(null)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") setEditingTaskId(null);
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
                  <span className="task-time">{task.dueTime}</span>
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

          {/* Timer/Stopwatch */}
          <section className="card timer-card">
            <h2>Stopwatch</h2>
            <div className="timer-display">{formatTimer(timerSeconds)}</div>
            <div className="timer-controls">
              <button onClick={() => setTimerActive(!timerActive)}>
                {timerActive ? "Pause" : "Start"}
              </button>
              <button onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>
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
