import React, { useEffect, useState } from "react";
import "../styles/dashboard.css";

type Task = {
  id: number;
  title: string;
  done: boolean;
};

type Reminder = {
  id: number;
  title: string;
  time: string; // e.g. "18:30"
};

const DashboardPage: React.FC = () => {
  // ====== STATE ======
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const [commuteFrom, setCommuteFrom] = useState("Home");
  const [commuteTo, setCommuteTo] = useState("Campus");
  const [commuteEstimate, setCommuteEstimate] = useState<string | null>(null);

  // Set tab title
  useEffect(() => {
    document.title = "SPaW Dashboard";
  }, []);

  // ====== EFFECTS ======

  // Focus timer tick
  useEffect(() => {
    if (!timerRunning) return;

    const id = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timerRunning]);

  // TODO: replace with real fetches from your backend later
  useEffect(() => {
    // Example initial tasks
    setTasks([
      { id: 1, title: "Review today’s tasks", done: false },
      { id: 2, title: "Study 30 mins (MIPS / Econ)", done: false },
      { id: 3, title: "Check tomorrow’s schedule", done: false },
    ]);

    // Example reminders
    setReminders([
      { id: 1, title: "Take evening meds", time: "21:00" },
      { id: 2, title: "Call Mom", time: "19:30" },
    ]);
  }, []);

  // ====== HANDLERS ======

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now(), title: newTask.trim(), done: false },
    ]);
    setNewTask("");
    // TODO: POST to /api/tasks
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
    // TODO: PATCH /api/tasks/:id
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderTime) return;
    setReminders((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newReminderTitle.trim(),
        time: newReminderTime,
      },
    ]);
    setNewReminderTitle("");
    setNewReminderTime("");
    // TODO: POST /api/reminders
  };

  const handleStartTimer = () => setTimerRunning(true);
  const handlePauseTimer = () => setTimerRunning(false);
  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleEstimateCommute = () => {
    // Placeholder logic — later call your real API
    if (commuteFrom === commuteTo) {
      setCommuteEstimate("You’re already there 😊");
      return;
    }

    if (commuteFrom === "Home" && commuteTo === "Campus") {
      setCommuteEstimate("Est. 35–45 minutes (traffic-sensitive).");
    } else if (commuteFrom === "Campus" && commuteTo === "Work") {
      setCommuteEstimate("Est. 25–35 minutes.");
    } else {
      setCommuteEstimate("Est. 20–40 minutes depending on traffic.");
    }
  };

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((t) => t.done).length / tasks.length) * 100
        );

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="spaw-page">
      {/* NAVBAR */}
      <header className="spaw-nav">
        <div className="spaw-logo">SPaW</div>
        <nav className="spaw-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#community">Community</a>
          <a href="#platform">Platform</a>
          <a href="#membership">Membership</a>
          <a href="#contact">Contact</a>
        </nav>
        <button className="nav-profile-btn">My Account</button>
      </header>

      {/* HERO + DASHBOARD OVERVIEW */}
      <section id="home" className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome back, Kb 👋</h1>
            <p className="hero-subtitle">
              It&apos;s <strong>{today}</strong>. Let&apos;s organize your mind,
              schedule, and wellbeing in one place.
            </p>
            <div className="hero-cta-row">
              <button className="primary-btn">Start Focus Session</button>
              <button className="secondary-btn">Add New Task</button>
            </div>
            <p className="hero-metric">
              Today&apos;s completion rate: <span>{completionRate}%</span>
            </p>
          </div>

          <div className="hero-widgets">
            {/* Quick glimpse cards */}
            <div className="hero-widget-card">
              <h3>Today&apos;s Tasks</h3>
              <ul>
                {tasks.slice(0, 3).map((t) => (
                  <li key={t.id} className={t.done ? "task-done" : ""}>
                    {t.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hero-widget-card">
              <h3>Next Reminder</h3>
              {reminders.length > 0 ? (
                <p>
                  {reminders[0].title} at <strong>{reminders[0].time}</strong>
                </p>
              ) : (
                <p>No reminders set yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD GRID */}
      <main className="dashboard-main">
        <section className="dashboard-grid">
          {/* Tasks */}
          <div className="dashboard-card">
            <h2>Tasks</h2>
            <div className="task-input-row">
              <input
                type="text"
                placeholder="Add a new task…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button onClick={handleAddTask}>Add</button>
            </div>
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleTask(task.id)}
                    />
                    <span className={task.done ? "task-done" : ""}>
                      {task.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Reminders */}
          <div className="dashboard-card">
            <h2>Reminders</h2>
            <div className="reminder-input-group">
              <input
                type="text"
                placeholder="Reminder title…"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
              />
              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
              <button onClick={handleAddReminder}>Save</button>
            </div>
            <ul className="reminder-list">
              {reminders.map((r) => (
                <li key={r.id}>
                  <span>{r.title}</span>
                  <span className="reminder-time">{r.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus Timer */}
          <div className="dashboard-card focus-card">
            <h2>Focus Timer</h2>
            <div className="timer-display">{formatTime(timerSeconds)}</div>
            <p className="timer-subtitle">
              Use this to do 25–50 minute deep work blocks.
            </p>
            <div className="timer-controls">
              {!timerRunning && (
                <button onClick={handleStartTimer}>Start</button>
              )}
              {timerRunning && (
                <button onClick={handlePauseTimer}>Pause</button>
              )}
              <button onClick={handleResetTimer}>Reset</button>
            </div>
          </div>

          {/* Commute Planner */}
          <div className="dashboard-card commute-card">
            <h2>Commute Planner</h2>
            <p className="commute-description">
              Plan your travel time to class, work, or home.
            </p>
            <div className="commute-selects">
              <div>
                <label>From</label>
                <select
                  value={commuteFrom}
                  onChange={(e) => setCommuteFrom(e.target.value)}
                >
                  <option>Home</option>
                  <option>Campus</option>
                  <option>Work</option>
                </select>
              </div>
              <div>
                <label>To</label>
                <select
                  value={commuteTo}
                  onChange={(e) => setCommuteTo(e.target.value)}
                >
                  <option>Home</option>
                  <option>Campus</option>
                  <option>Work</option>
                </select>
              </div>
            </div>
            <button onClick={handleEstimateCommute}>Estimate Time</button>
            {commuteEstimate && (
              <p className="commute-result">{commuteEstimate}</p>
            )}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section">
          <div className="about-card">
            <h2>ABOUT SPaW</h2>
            <p>
              SPaW (Smart Personal Assistant Web App) is your digital HQ for
              productivity and wellbeing. Manage tasks, reminders, focus time,
              journaling, and life admin in one place. Think of it as a
              Notion-meets-daily-routine, but personalized and AI-powered.
            </p>
          </div>
        </section>

        {/* COMMUNITY SECTION */}
        <section id="community" className="community-section">
          <h2>OUR COMMUNITY</h2>
          <p className="section-subtitle">
            Join a community of like-minded builders, students, and dreamers
            using SPaW to create better habits and systems.
          </p>
          <div className="community-grid">
            <div className="community-tile tile-1" />
            <div className="community-tile tile-2" />
            <div className="community-tile tile-3" />
            <div className="community-tile tile-4" />
          </div>
        </section>

        {/* PLATFORM SNAPSHOTS */}
        <section id="platform" className="platform-section">
          <h2>PLATFORM</h2>
          <p className="section-subtitle">
            A quick peek at some of your SPaW spaces.
          </p>
          <div className="platform-grid">
            <div className="platform-card">
              <h3>Weather & Day Overview</h3>
              <p>
                See the forecast and your most important events at a glance
                before you head out.
              </p>
            </div>
            <div className="platform-card">
              <h3>Focus Mode Café</h3>
              <p>
                A cozy timer space that feels like studying in your favorite
                coffee shop.
              </p>
            </div>
            <div className="platform-card">
              <h3>Journaling & Gratitude</h3>
              <p>
                Quickly capture thoughts, prayers, gratitude, and reflections
                between classes or shifts.
              </p>
            </div>
            <div className="platform-card">
              <h3>Habit Tracking</h3>
              <p>
                Small daily check-ins for sleep, movement, water, and spiritual
                practices.
              </p>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP / VALUE SECTION */}
        <section id="membership" className="membership-section">
          <h2>MEMBERSHIP</h2>
          <p className="section-subtitle">
            Unlock the full SPaW experience as you grow.
          </p>
          <div className="membership-grid">
            <div className="membership-item">
              <h4>Personalized Productivity Tools</h4>
              <p>Dashboards tailored to student, worker, or creator life.</p>
            </div>
            <div className="membership-item">
              <h4>Wellness & Motivation</h4>
              <p>Prompts and reminders that support both mind and spirit.</p>
            </div>
            <div className="membership-item">
              <h4>Community Support</h4>
              <p>Spaces to share wins, struggles, and systems that work.</p>
            </div>
            <div className="membership-item">
              <h4>AI-Powered Insights</h4>
              <p>
                See patterns in your schedule and get smarter suggestions.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT / ABOUT ME */}
        <section id="contact" className="contact-section">
          <div className="contact-card">
            <h2>CONTACT</h2>
            <p>Want to collaborate, test SPaW, or share feedback?</p>
            <form
              className="contact-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="Your email" required />
              <textarea placeholder="Your message…" rows={3} />
              <button type="submit">Send</button>
            </form>
          </div>

          <div className="about-me-card">
            <h3>About Me</h3>
            <p>
              I&apos;m Kebron, a software engineering student building SPaW as a tool for people juggling school,
              work, and life. This is the first version of a much bigger vision.
            </p>
          </div>
        </section>
      </main>

      <footer className="spaw-footer">
        <p>© {new Date().getFullYear()} SPaW by Kebron Manyazwal.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
