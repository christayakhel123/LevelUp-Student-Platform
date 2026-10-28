
import { useEffect, useState } from "react";
import "./Dashboard.css";

const initialTasks = [
  { id: 1, title: "Complete DBMS assignment", category: "Assignment", done: false },
  { id: 2, title: "Practice Python coding", category: "Coding", done: false },
  { id: 3, title: "Revise computer networks", category: "Study", done: true },
];

const navigation = [
  ["Dashboard", "▦"],
  ["My Tasks", "✓"],
  ["Study Tracker", "◷"],
  ["Coding Practice", "⌘"],
  ["Projects", "▤"],
  ["Certifications", "♧"],
  ["Insights", "↗"],
  ["Settings", "⚙"],
];

function readData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function EmptyState({ icon = "🌱", title, description }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function SectionHeading({ icon, title, description, color = "sage" }) {
  return (
    <div className="section-heading">
      <span className={`heading-icon ${color}-icon`}>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function userStorageKey(userId, key) {
  return `levelup:${userId}:${key}`;
}

function Dashboard({ onNavigate, user }) {
  const userId = user.id;
  const [activePage, setActivePage] = useState("Dashboard");

  const [tasks, setTasks] = useState(() =>
    readData(userStorageKey(userId, "tasks"), initialTasks)
  );
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("Study");

  const [studySessions, setStudySessions] = useState(() =>
    readData(userStorageKey(userId, "study-sessions"), [])
  );
  const [subject, setSubject] = useState("Computer Networks");
  const [studyGoal, setStudyGoal] = useState(() =>
    Number(localStorage.getItem(userStorageKey(userId, "study-goal"))) || 4
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [codingSessions, setCodingSessions] = useState(() =>
    readData(userStorageKey(userId, "coding-sessions"), [])
  );
  const [codingLanguage, setCodingLanguage] = useState("Python");
  const [codingTopic, setCodingTopic] = useState("");
  const [codingProblems, setCodingProblems] = useState("1");
  const [codingMinutes, setCodingMinutes] = useState("30");
  const [codingNotes, setCodingNotes] = useState("");

  const [projects, setProjects] = useState(() =>
    readData(userStorageKey(userId, "projects"), [])
  );
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCategory, setProjectCategory] = useState("Web Development");
  const [projectStatus, setProjectStatus] = useState("In progress");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [certifications, setCertifications] = useState(() =>
    readData(userStorageKey(userId, "certifications"), [])
  );
  const [certTitle, setCertTitle] = useState("");
  const [certProvider, setCertProvider] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certLink, setCertLink] = useState("");

  const [profileName, setProfileName] = useState(
    () => localStorage.getItem(userStorageKey(userId, "profile-name")) || user.name || "Student"
  );
  const [profileGoal, setProfileGoal] = useState(
    () => localStorage.getItem(userStorageKey(userId, "profile-goal")) || "Build consistent study habits"
  );
  const [accentTheme, setAccentTheme] = useState(
    () => localStorage.getItem(userStorageKey(userId, "theme")) || "sage"
  );
  const [taskFilter, setTaskFilter] = useState("All");

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "tasks"), JSON.stringify(tasks));
  }, [tasks, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "study-sessions"), JSON.stringify(studySessions));
  }, [studySessions, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "coding-sessions"), JSON.stringify(codingSessions));
  }, [codingSessions, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "projects"), JSON.stringify(projects));
  }, [projects, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "certifications"), JSON.stringify(certifications));
  }, [certifications, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "profile-name"), profileName);
  }, [profileName, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "profile-goal"), profileGoal);
  }, [profileGoal, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "theme"), accentTheme);
  }, [accentTheme, userId]);

  useEffect(() => {
    localStorage.setItem(userStorageKey(userId, "study-goal"), String(studyGoal));
  }, [studyGoal, userId]);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const today = todayKey();
  const todaySessions = studySessions.filter((session) => session.date === today);
  const todayStudySeconds = todaySessions.reduce(
    (total, session) => total + session.duration,
    0
  );
  const completedTasks = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const studyProgress = Math.min(
    100,
    Math.round((todayStudySeconds / (studyGoal * 3600)) * 100)
  );
  const totalProblems = codingSessions.reduce(
    (total, session) => total + Number(session.problems || 0),
    0
  );
  const totalStudySeconds = studySessions.reduce(
    (total, session) => total + session.duration,
    0
  );

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title: newTask.trim(),
        category,
        done: false,
      },
    ]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function saveStudySession() {
    if (elapsedSeconds < 1) return;
    setStudySessions((current) => [
      {
        id: Date.now(),
        subject,
        duration: elapsedSeconds,
        date: todayKey(),
      },
      ...current,
    ]);
    setElapsedSeconds(0);
    setIsTimerRunning(false);
  }

  function addCodingSession(event) {
    event.preventDefault();
    const problems = Number(codingProblems);
    const minutes = Number(codingMinutes);
    if (!codingTopic.trim() || problems < 0 || minutes < 1) return;

    setCodingSessions((current) => [
      {
        id: Date.now(),
        language: codingLanguage,
        topic: codingTopic.trim(),
        problems,
        minutes,
        notes: codingNotes.trim(),
        date: todayKey(),
      },
      ...current,
    ]);
    setCodingTopic("");
    setCodingProblems("1");
    setCodingMinutes("30");
    setCodingNotes("");
  }

  function addProject(event) {
    event.preventDefault();
    if (!projectTitle.trim()) return;
    setProjects((current) => [
      {
        id: Date.now(),
        title: projectTitle.trim(),
        category: projectCategory,
        status: projectStatus,
        dueDate: projectDueDate,
        description: projectDescription.trim(),
      },
      ...current,
    ]);
    setProjectTitle("");
    setProjectDescription("");
    setProjectDueDate("");
    setProjectStatus("In progress");
  }

  function updateProjectStatus(id, status) {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, status } : project
      )
    );
  }

  function addCertification(event) {
    event.preventDefault();
    if (!certTitle.trim() || !certProvider.trim()) return;
    setCertifications((current) => [
      {
        id: Date.now(),
        title: certTitle.trim(),
        provider: certProvider.trim(),
        date: certDate,
        link: certLink.trim(),
      },
      ...current,
    ]);
    setCertTitle("");
    setCertProvider("");
    setCertDate("");
    setCertLink("");
  }

  function renderTaskList(limit = Infinity, showDelete = false) {
    const filteredTasks = tasks.filter((task) => {
      if (taskFilter === "Completed") return task.done;
      if (taskFilter === "Pending") return !task.done;
      return true;
    }).slice(0, limit);

    if (!filteredTasks.length) {
      return (
        <EmptyState
          icon="🌱"
          title="Nothing here yet"
          description="Add a task to start making progress."
        />
      );
    }

    return (
      <div className="task-list">
        {filteredTasks.map((task) => (
          <div className="task-row" key={task.id}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
              aria-label={`Mark ${task.title} as ${task.done ? "incomplete" : "complete"}`}
            />
            <div className="task-copy">
              <span className={task.done ? "task-title completed" : "task-title"}>
                {task.title}
              </span>
              <small>{task.category}</small>
            </div>
            <span className={task.done ? "task-status done" : "task-status"}>
              {task.done ? "Done" : "To do"}
            </span>
            {showDelete && (
              <button
                className="delete-button"
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete ${task.title}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-section">
          <div className="welcome-copy">
            <p className="eyebrow">YOUR PERSONAL PRODUCTIVITY SPACE</p>
            <h1>Small steps, big progress. <span>✦</span></h1>
            <p className="welcome-description">
              Welcome back, {profileName || "Student"}! Stay focused, build good habits,
              and make today count.
            </p>
            <button className="primary-button" onClick={() => setActivePage("My Tasks")}>
              Plan my day <span>→</span>
            </button>
          </div>
          <div className="welcome-illustration">
            <span className="illustration-sparkle">✦</span>
            🌿
            <span className="illustration-dot">•</span>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon sage">✓</div>
            <p>Tasks completed</p>
            <h2>{completedTasks}<span> / {tasks.length}</span></h2>
            <small>Keep up the momentum</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon peach">◷</div>
            <p>Study time today</p>
            <h2>{(todayStudySeconds / 3600).toFixed(1)}<span> hrs</span></h2>
            <small>Goal: {studyGoal} hours</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon lavender">⌘</div>
            <p>Coding sessions</p>
            <h2>{codingSessions.length}<span> total</span></h2>
            <small>{totalProblems} problems logged</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon yellow">✧</div>
            <p>Projects</p>
            <h2>{projects.length}<span> saved</span></h2>
            <small>Keep building your portfolio</small>
          </article>
        </section>

        <section className="content-grid">
          <article className="surface-card">
            <div className="panel-heading">
              <div>
                <h2>Today's tasks</h2>
                <p>A little progress is still progress.</p>
              </div>
              <button className="text-action" onClick={() => setActivePage("My Tasks")}>
                View all →
              </button>
            </div>
            <div className="progress-label">
              <span>Daily task progress</span><strong>{progress}%</strong>
            </div>
            <div className="progress-track">
              <span className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            {renderTaskList(4)}
          </article>

          <article className="surface-card">
            <div className="panel-heading">
              <div>
                <h2>Study progress</h2>
                <p>Make time for what matters.</p>
              </div>
              <span className="panel-emoji">📚</span>
            </div>
            <div className="study-summary">
              <strong>{(todayStudySeconds / 3600).toFixed(1)} <small>hrs</small></strong>
              <span className="goal-badge">Goal: {studyGoal} hrs</span>
            </div>
            <div className="progress-track study-track">
              <span className="progress-fill study-fill" style={{ width: `${studyProgress}%` }} />
            </div>
            <p className="goal-note">{studyProgress}% of your daily goal</p>
            <div className="quote-box">“Consistency is more important than perfection.”</div>
            <button className="primary-button full-button" onClick={() => setActivePage("Study Tracker")}>
              Open study tracker →
            </button>
          </article>
        </section>
      </>
    );
  }

  function renderTasksPage() {
    return (
      <section className="page-wrap">
        <div className="page-intro">
          <p className="eyebrow">MAKE ROOM FOR WHAT MATTERS</p>
          <h1>My Tasks <span>✦</span></h1>
          <p>Break your goals into small, manageable steps.</p>
        </div>
        <div className="surface-card page-card">
          <SectionHeading icon="✓" title="Your to-do list" description="Add tasks, track progress, and celebrate each win." />
          <form className="form-grid task-form" onSubmit={addTask}>
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="What do you need to get done?" required maxLength={120} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Study</option><option>Assignment</option><option>Coding</option><option>Project</option><option>Personal</option>
            </select>
            <button className="primary-button" type="submit">+ Add task</button>
          </form>
          <div className="task-overview">
            <div><span>Total tasks</span><strong>{tasks.length}</strong></div>
            <div><span>Completed</span><strong>{completedTasks}</strong></div>
            <div><span>Remaining</span><strong>{tasks.length - completedTasks}</strong></div>
          </div>
          <div className="progress-label"><span>Overall progress</span><strong>{progress}%</strong></div>
          <div className="progress-track"><span className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="filter-row">
            <span>Show tasks</span>
            {["All", "Pending", "Completed"].map((filter) => (
              <button key={filter} className={taskFilter === filter ? "filter-button active" : "filter-button"} onClick={() => setTaskFilter(filter)} type="button">{filter}</button>
            ))}
          </div>
          {renderTaskList(Infinity, true)}
        </div>
      </section>
    );
  }

  function renderStudyPage() {
    return (
      <section className="page-wrap">
        <div className="page-intro">
          <p className="eyebrow">FOCUS ON YOUR GROWTH</p>
          <h1>Study Tracker <span>◷</span></h1>
          <p>Build consistency one focused session at a time.</p>
        </div>
        <div className="study-overview">
          <article className="overview-card sage-card"><span>Today's study time</span><strong>{(todayStudySeconds / 3600).toFixed(1)} <small>hrs</small></strong><span>Across {todaySessions.length} saved sessions</span></article>
          <article className="overview-card lavender-card"><span>Daily goal</span><strong>{studyGoal} <small>hrs</small></strong><span>{studyProgress}% completed today</span></article>
          <article className="overview-card peach-card"><span>Total study time</span><strong>{(totalStudySeconds / 3600).toFixed(1)} <small>hrs</small></strong><span>All saved sessions</span></article>
        </div>
        <div className="study-layout">
          <section className="surface-card timer-card">
            <span className="timer-label">✦ YOUR FOCUS SESSION</span>
            <h2>Time to focus</h2>
            <p>Choose a subject, start the timer, and save your session when you're done.</p>
            <label htmlFor="study-subject">What are you studying?</label>
            <select id="study-subject" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={isTimerRunning}>
              <option>Computer Networks</option><option>DBMS</option><option>Data Structures</option><option>Python</option><option>Java</option><option>Machine Learning</option><option>Web Development</option><option>GATE preparation</option><option>Other</option>
            </select>
            <div className="timer-display">{formatTime(elapsedSeconds)}</div>
            <p className="timer-caption">{isTimerRunning ? "You're doing great. Keep going!" : "Every focused minute counts."}</p>
            <div className="timer-actions">
              <button className="primary-button" onClick={() => setIsTimerRunning((running) => !running)}>{isTimerRunning ? "Ⅱ Pause" : "▶ Start focus"}</button>
              <button className="secondary-button" onClick={() => { setIsTimerRunning(false); setElapsedSeconds(0); }}>↺ Reset</button>
            </div>
            <button className="secondary-button save-session-button" onClick={saveStudySession} disabled={elapsedSeconds < 1}>Save study session</button>
          </section>
          <section className="surface-card goal-card">
            <SectionHeading icon="◎" title="Your daily goal" description="Set a realistic target for today." />
            <label htmlFor="study-goal">Hours of study per day</label>
            <select id="study-goal" value={studyGoal} onChange={(e) => setStudyGoal(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => <option key={hours} value={hours}>{hours} {hours === 1 ? "hour" : "hours"}</option>)}
            </select>
            <div className="goal-progress-circle" style={{ "--progress": `${studyProgress}%` }}>
              <div><strong>{studyProgress}%</strong><span>completed</span></div>
            </div>
            <p className="goal-note">{Math.max(0, studyGoal * 3600 - todayStudySeconds) > 0 ? `${formatDuration(studyGoal * 3600 - todayStudySeconds)} left to reach your goal.` : "You've reached your study goal. Wonderful work!"}</p>
          </section>
        </div>
        <section className="surface-card page-card history-card">
          <SectionHeading icon="↗" title="Recent study sessions" description="A record of the time you've invested in yourself." />
          {todaySessions.length === 0 ? (
            <EmptyState icon="📖" title="Your study history starts here" description="Complete a timer session and save it to see it here." />
          ) : todaySessions.map((session) => (
            <div className="history-row" key={session.id}>
              <span className="history-icon">📚</span>
              <div className="history-copy"><strong>{session.subject}</strong><small>{session.date}</small></div>
              <strong className="history-value">{formatDuration(session.duration)}</strong>
            </div>
          ))}
        </section>
      </section>
    );
  }

  function renderCodingPage() {
    return (
      <section className="page-wrap">
        <div className="feature-hero coding-hero">
          <div><span className="hero-kicker">ONE PROBLEM AT A TIME</span><h1>Practice makes <em>progress.</em></h1><p>Keep a record of the problems you solve and the concepts you learn.</p></div>
          <div className="hero-art purple-art">⌘</div>
        </div>
        <div className="coding-stats-grid">
          <article className="coding-stat stat-purple"><span className="coding-stat-icon">⌘</span><p>Practice sessions</p><h3>{codingSessions.length}</h3></article>
          <article className="coding-stat stat-blue"><span className="coding-stat-icon">✓</span><p>Problems solved</p><h3>{totalProblems}</h3></article>
          <article className="coding-stat stat-peach"><span className="coding-stat-icon">◷</span><p>Practice time</p><h3>{codingSessions.reduce((total, session) => total + Number(session.minutes || 0), 0)} <small>min</small></h3></article>
        </div>
        <div className="coding-layout">
          <section className="surface-card page-card">
            <SectionHeading icon="＋" title="Log a practice session" description="Capture what you worked on today." color="lavender" />
            <form className="stack-form" onSubmit={addCodingSession}>
              <label htmlFor="coding-language">Programming language</label>
              <select id="coding-language" value={codingLanguage} onChange={(e) => setCodingLanguage(e.target.value)}><option>Python</option><option>Java</option><option>C</option><option>C++</option><option>JavaScript</option><option>SQL</option><option>Other</option></select>
              <label htmlFor="coding-topic">Topic or problem name</label>
              <input id="coding-topic" value={codingTopic} onChange={(e) => setCodingTopic(e.target.value)} placeholder="e.g. Arrays and strings" required maxLength={100} />
              <div className="two-fields">
                <div><label htmlFor="coding-problems">Problems solved</label><input id="coding-problems" type="number" min="0" max="1000" value={codingProblems} onChange={(e) => setCodingProblems(e.target.value)} required /></div>
                <div><label htmlFor="coding-minutes">Minutes spent</label><input id="coding-minutes" type="number" min="1" max="1440" value={codingMinutes} onChange={(e) => setCodingMinutes(e.target.value)} required /></div>
              </div>
              <label htmlFor="coding-notes">Notes (optional)</label>
              <textarea id="coding-notes" rows="3" value={codingNotes} onChange={(e) => setCodingNotes(e.target.value)} placeholder="What did you learn?" maxLength={500} />
              <button className="primary-button coding-submit" type="submit">Save practice session ↗</button>
            </form>
          </section>
          <section className="surface-card page-card">
            <SectionHeading icon="◷" title="Practice history" description="Your recent coding activity." color="blue" />
            {codingSessions.length === 0 ? (
              <EmptyState icon="💻" title="Your journey starts here" description="Log your first coding session to see it appear here." />
            ) : (
              <div className="history-list">
                {codingSessions.map((session) => (
                  <article className="coding-history-item" key={session.id}>
                    <span className="language-badge">{session.language.slice(0, 2).toUpperCase()}</span>
                    <div className="coding-history-details"><strong>{session.topic}</strong><p>{session.language} · {session.date}</p><div className="tag-row"><span>{session.problems} problems</span><span>{session.minutes} min</span></div>{session.notes && <small>{session.notes}</small>}</div>
                    <button className="delete-button" onClick={() => setCodingSessions((current) => current.filter((item) => item.id !== session.id))} aria-label="Delete session">×</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    );
  }

  function renderProjectsPage() {
    return (
      <section className="page-wrap">
        <div className="page-intro"><p className="eyebrow">IDEAS INTO ACTION</p><h1>My Projects <span>✦</span></h1><p>Keep your coursework, experiments, and portfolio projects organized.</p></div>
        <div className="two-column-layout">
          <section className="surface-card page-card">
            <SectionHeading icon="＋" title="Add a project" description="Record your next idea or current work." />
            <form className="stack-form" onSubmit={addProject}>
              <label htmlFor="project-title">Project name</label><input id="project-title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="e.g. Student productivity app" required maxLength={100} />
              <label htmlFor="project-category">Category</label><select id="project-category" value={projectCategory} onChange={(e) => setProjectCategory(e.target.value)}><option>Web Development</option><option>Artificial Intelligence</option><option>Data Science</option><option>Cybersecurity</option><option>IoT</option><option>Other</option></select>
              <label htmlFor="project-status">Status</label><select id="project-status" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}><option>Planned</option><option>In progress</option><option>Completed</option></select>
              <label htmlFor="project-due">Target date (optional)</label><input id="project-due" type="date" value={projectDueDate} onChange={(e) => setProjectDueDate(e.target.value)} />
              <label htmlFor="project-description">Description (optional)</label><textarea id="project-description" rows="3" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} placeholder="What are you building?" maxLength={500} />
              <button className="primary-button" type="submit">+ Save project</button>
            </form>
          </section>
          <section className="surface-card page-card">
            <SectionHeading icon="▤" title="Your portfolio" description={`${projects.length} project${projects.length === 1 ? "" : "s"} saved`} color="lavender" />
            {projects.length === 0 ? <EmptyState icon="🪴" title="Make something meaningful" description="Your projects will appear here after you add one." /> : (
              <div className="project-list">{projects.map((project) => (
                <article className="project-item" key={project.id}>
                  <div className="project-item-top"><span className="project-symbol">✦</span><span className={`status-pill ${project.status.toLowerCase().replace(" ", "-")}`}>{project.status}</span></div>
                  <h3>{project.title}</h3><p>{project.description || "A new project in your learning journey."}</p>
                  <div className="project-meta"><span>{project.category}</span>{project.dueDate && <span>Due {project.dueDate}</span>}</div>
                  <div className="project-actions"><label htmlFor={`status-${project.id}`}>Update status</label><select id={`status-${project.id}`} value={project.status} onChange={(e) => updateProjectStatus(project.id, e.target.value)}><option>Planned</option><option>In progress</option><option>Completed</option></select><button className="delete-button" onClick={() => setProjects((current) => current.filter((item) => item.id !== project.id))} aria-label={`Delete ${project.title}`}>×</button></div>
                </article>
              ))}</div>
            )}
          </section>
        </div>
      </section>
    );
  }

  function renderCertificationsPage() {
    return (
      <section className="page-wrap">
        <div className="feature-hero certificate-hero"><div><span className="hero-kicker">EVERY ACHIEVEMENT COUNTS</span><h1>Proof of your <em>progress.</em></h1><p>Keep your courses, certifications, and professional milestones together.</p></div><div className="hero-art gold-art">♧</div></div>
        <div className="two-column-layout">
          <section className="surface-card page-card">
            <SectionHeading icon="＋" title="Add a certification" description="Save a course or certificate you've earned." color="peach" />
            <form className="stack-form" onSubmit={addCertification}>
              <label htmlFor="cert-title">Certificate or course name</label><input id="cert-title" value={certTitle} onChange={(e) => setCertTitle(e.target.value)} placeholder="e.g. Python Essentials 1" required maxLength={120} />
              <label htmlFor="cert-provider">Provider</label><input id="cert-provider" value={certProvider} onChange={(e) => setCertProvider(e.target.value)} placeholder="e.g. Cisco Networking Academy" required maxLength={100} />
              <label htmlFor="cert-date">Completion date (optional)</label><input id="cert-date" type="date" value={certDate} onChange={(e) => setCertDate(e.target.value)} />
              <label htmlFor="cert-link">Certificate link (optional)</label><input id="cert-link" type="url" value={certLink} onChange={(e) => setCertLink(e.target.value)} placeholder="https://..." />
              <button className="primary-button" type="submit">+ Save certificate</button>
            </form>
          </section>
          <section className="surface-card page-card">
            <SectionHeading icon="♧" title="My achievements" description={`${certifications.length} certificate${certifications.length === 1 ? "" : "s"} recorded`} color="peach" />
            {certifications.length === 0 ? <EmptyState icon="🏆" title="Celebrate your learning" description="Add a certificate to start building your achievement list." /> : (
              <div className="certificate-list">{certifications.map((cert) => (
                <article className="certificate-item" key={cert.id}>
                  <span className="certificate-icon">🎓</span><div className="certificate-copy"><h3>{cert.title}</h3><p>{cert.provider}</p>{cert.date && <small>Completed {cert.date}</small>}{cert.link && <a href={cert.link} target="_blank" rel="noreferrer">View certificate ↗</a>}</div>
                  <button className="delete-button" onClick={() => setCertifications((current) => current.filter((item) => item.id !== cert.id))} aria-label={`Delete ${cert.title}`}>×</button>
                </article>
              ))}</div>
            )}
          </section>
        </div>
      </section>
    );
  }

  function renderInsightsPage() {
    const totalCodingMinutes = codingSessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);
    const completedProjects = projects.filter((project) => project.status === "Completed").length;
    const activity = [
      ["Tasks", tasks.length, "bar-green"],
      ["Study sessions", studySessions.length, "bar-purple"],
      ["Coding sessions", codingSessions.length, "bar-blue"],
      ["Projects", projects.length, "bar-peach"],
      ["Certificates", certifications.length, "bar-yellow"],
    ];
    const maxActivity = Math.max(1, ...activity.map((item) => item[1]));

    return (
      <section className="page-wrap">
        <div className="feature-hero insights-hero"><div><span className="hero-kicker">LOOK HOW FAR YOU'VE COME</span><h1>Your effort is <em>adding up.</em></h1><p>A friendly overview of your tasks, study time, coding sessions, and portfolio.</p></div><div className="hero-art purple-art">↗</div></div>
        <div className="insight-stats-grid">
          <article className="insight-stat stat-green"><span>✓ Task completion</span><strong>{progress}%</strong><div className="progress-track"><span className="progress-fill" style={{ width: `${progress}%` }} /></div><p>{completedTasks} of {tasks.length} tasks completed</p></article>
          <article className="insight-stat stat-purple"><span>◷ Total study time</span><strong>{(totalStudySeconds / 3600).toFixed(1)} <small>hrs</small></strong><p>Time saved in your study tracker</p></article>
          <article className="insight-stat stat-blue"><span>⌘ Coding problems</span><strong>{totalProblems}</strong><p>{totalCodingMinutes} minutes of practice logged</p></article>
          <article className="insight-stat stat-peach"><span>✦ Portfolio</span><strong>{projects.length + certifications.length}</strong><p>{projects.length} projects · {certifications.length} certificates</p></article>
        </div>
        <div className="two-column-layout">
          <section className="surface-card page-card">
            <SectionHeading icon="◈" title="Activity at a glance" description="Everything you've recorded so far." color="lavender" />
            {activity.map(([label, value, color]) => (
              <div className="activity-row" key={label}><div className="activity-label"><strong>{label}</strong><b>{value}</b></div><div className="activity-track"><span className={color} style={{ width: `${value ? Math.max(8, (value / maxActivity) * 100) : 0}%` }} /></div></div>
            ))}
          </section>
          <section className="surface-card page-card">
            <SectionHeading icon="✦" title="Your growth notes" description="Small steps make a big difference." color="peach" />
            <div className="growth-note note-lilac"><span>🌱</span><div><strong>Keep your rhythm</strong><p>{studySessions.length ? `You've saved ${studySessions.length} study sessions. Keep showing up for yourself.` : "Start the study timer to begin building your study history."}</p></div></div>
            <div className="growth-note note-blue"><span>💡</span><div><strong>Practice makes progress</strong><p>{totalProblems ? `You've recorded ${totalProblems} coding problems. Every problem is experience.` : "Log a coding session to track your practice."}</p></div></div>
            <div className="growth-note note-peach"><span>🏆</span><div><strong>Build your portfolio</strong><p>{completedProjects ? `${completedProjects} project${completedProjects === 1 ? "" : "s"} completed — celebrate that progress!` : "Finish a project or save a certificate to record your achievements."}</p></div></div>
            <button className="secondary-button" onClick={() => setActivePage("My Tasks")}>Go to my tasks ↗</button>
          </section>
        </div>
        <p className="local-note">Insights are calculated from the information you've saved in this browser.</p>
      </section>
    );
  }

  function renderSettingsPage() {
    const themes = [
      ["sage", "Sage garden", "Calm green", "#83a889"],
      ["lavender", "Lavender haze", "Soft purple", "#9b87e8"],
      ["ocean", "Blue sky", "Clear and focused", "#6ca7e9"],
      ["peach", "Peach glow", "Warm and sunny", "#e99a77"],
    ];

    return (
      <section className="page-wrap">
        <div className="feature-hero settings-hero"><div><span className="hero-kicker">YOUR SPACE, YOUR PACE</span><h1>A workspace that feels <em>like you.</em></h1><p>Personalize your profile and choose the colors that help you feel focused.</p></div><div className="hero-art sage-art">⚙</div></div>
        <div className="settings-layout">
          <section className="surface-card page-card">
            <SectionHeading icon="☺" title="Profile details" description="A little about the person behind the progress." />
            <form className="stack-form" onSubmit={(e) => { e.preventDefault(); localStorage.setItem(userStorageKey(userId, "profile-name"), profileName); localStorage.setItem(userStorageKey(userId, "profile-goal"), profileGoal); }}>
              <label htmlFor="profile-name">What should we call you?</label><input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your name" required maxLength={40} />
              <label htmlFor="profile-goal">Your current focus</label><input id="profile-goal" value={profileGoal} onChange={(e) => setProfileGoal(e.target.value)} placeholder="e.g. Learn Python consistently" maxLength={100} />
              <button className="primary-button" type="submit">Save profile</button>
            </form>
            <div className="settings-tip">✧ <span>Your details are saved in this browser for your account.</span></div>
          </section>
          <section className="surface-card page-card">
            <SectionHeading icon="◐" title="Choose your color mood" description="Pick the accent that feels right for today." color="lavender" />
            <div className="theme-options">{themes.map(([id, name, desc, color]) => (
              <button type="button" key={id} className={`theme-option ${accentTheme === id ? "selected" : ""}`} onClick={() => setAccentTheme(id)}>
                <span className="theme-swatch" style={{ background: color }} /><span className="theme-copy"><strong>{name}</strong><small>{desc}</small></span><span className="theme-check">{accentTheme === id ? "✓" : "○"}</span>
              </button>
            ))}</div>
            <p className="theme-note">Your selection is saved automatically.</p>
          </section>
          <section className="surface-card page-card settings-storage">
            <SectionHeading icon="🔒" title="Data & privacy" description="Understand where your information lives." color="blue" />
            <div className="privacy-row"><div><strong>Browser storage</strong><p>Tasks, study logs, coding sessions, projects, and certificates are stored separately for your account in this browser.</p></div><span className="privacy-badge">Local only</span></div>
            <div className="privacy-row"><div><strong>No external API</strong><p>This frontend does not send data to a server. Clearing browser data may remove saved information.</p></div><span className="privacy-badge">On device</span></div>
            <button className="danger-button" type="button" onClick={() => {
              if (!window.confirm("Clear all LevelUp saved activity from this browser? This cannot be undone.")) return;
              ["tasks", "study-sessions", "coding-sessions", "projects", "certifications"].forEach((key) => localStorage.removeItem(userStorageKey(userId, key)));
              setTasks(initialTasks); setStudySessions([]); setCodingSessions([]); setProjects([]); setCertifications([]);
            }}>Clear activity data</button>
          </section>
        </div>
        <p className="local-note">Your current focus: {profileGoal || "Set a personal goal in your profile."}</p>
      </section>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "Dashboard": return renderDashboard();
      case "My Tasks": return renderTasksPage();
      case "Study Tracker": return renderStudyPage();
      case "Coding Practice": return renderCodingPage();
      case "Projects": return renderProjectsPage();
      case "Certifications": return renderCertificationsPage();
      case "Insights": return renderInsightsPage();
      case "Settings": return renderSettingsPage();
      default: return renderDashboard();
    }
  }

  return (
    <div className={`levelup theme-${accentTheme}`}>
      <aside className="sidebar">
        <button className="brand" onClick={() => setActivePage("Dashboard")}><span>🌱</span> LevelUp<span className="brand-dot">.</span></button>
        <p className="menu-label">WORKSPACE</p>
        <nav className="side-menu">
          {navigation.map(([name, icon]) => (
            <button key={name} className={`menu-item ${activePage === name ? "active" : ""}`} onClick={() => setActivePage(name)}>
              <span className="menu-icon">{icon}</span><span>{name}</span>{activePage === name && <span className="active-mark" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note"><span>✦</span><strong>One step at a time</strong><p>Your goals are closer than they feel.</p><div className="sidebar-note-art">🌼</div></div>
        <div className="sidebar-bottom"><div className="profile-avatar">{(profileName || "S").slice(0, 1).toUpperCase()}</div><div className="profile-copy"><strong>{profileName || "Student"}</strong><p>Keep growing!</p></div><button className="profile-settings" onClick={() => setActivePage("Settings")} aria-label="Open settings">⚙</button><button className="profile-logout" type="button" onClick={() => onNavigate("logout")} aria-label="Log out"><span aria-hidden="true">↪</span><span className="profile-logout-label">Log out</span></button></div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div><span className="breadcrumb-muted">My Workspace</span><span className="breadcrumb-separator">/</span><strong>{activePage}</strong></div>
          <div className="topbar-right"><span className="status-dot" /><span>Personal workspace</span><span className="topbar-avatar">{(profileName || "S").slice(0, 1).toUpperCase()}</span></div>
        </header>
        {renderPage()}
        <footer className="dashboard-footer">Made for your growth <span>♥</span> One day at a time.</footer>
      </main>
    </div>
  );
}

export default Dashboard;
