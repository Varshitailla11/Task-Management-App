import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckSquare,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  Menu,
  X,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Landing.css";


/* ---------------------------------------------------------
   CONTENT
   --------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Home", target: "top" },
  { label: "Features", target: "features" },
  { label: "How It Works", target: "how-it-works" },
  { label: "About", target: "about" },
];

const FEATURES = [
  {
    icon: CheckSquare,
    title: "Task Management",
    text: "Create tasks with priorities, statuses and due dates, then filter and search to find what matters right now.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    text: "Group work into projects, see progress at a glance and keep every task connected to the bigger picture.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    text: "Build teams, invite members and assign work so everyone knows what they own and what comes next.",
  },
  {
    icon: Columns3,
    title: "Kanban Board",
    text: "See every task grouped by To Do, In Progress and Completed, so the state of your workflow is clear at a glance.",
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    text: "See deadlines laid out by day and month so nothing sneaks up on you.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    text: "Track completion rate, overdue work and weekly momentum with clear, readable insights.",
  },
];

const STEPS = [
  {
    title: "Create a Team",
    text: "Start by bringing your people together in one shared workspace.",
  },
  {
    title: "Create a Project",
    text: "Set up a project for a goal, a client or a sprint and attach your team.",
  },
  {
    title: "Assign Tasks",
    text: "Break the work down, set priorities and deadlines, and give each task an owner.",
  },
  {
    title: "Track Progress",
    text: "Follow the board, calendar and analytics as work moves to done.",
  },
];

const PRINCIPLES = [
  "One workspace for tasks, projects and teams",
  "Clear priorities, deadlines and ownership",
  "Visual boards, calendars and progress tracking",
  "Built to stay out of your way",
];


/* ---------------------------------------------------------
   SCROLL HELPERS
   --------------------------------------------------------- */

function scrollToSection(target) {
  if (target === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  document
    .getElementById(target)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Fade sections in as they enter the viewport. If IntersectionObserver is
// unavailable, nothing is hidden.
function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll(".lp [data-reveal]");

    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}


/* ---------------------------------------------------------
   DASHBOARD PREVIEW (illustration built from markup)
   --------------------------------------------------------- */

function DashboardPreview() {
  const nav = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: CheckSquare, label: "My Tasks" },
    { icon: FolderKanban, label: "Projects" },
    { icon: Columns3, label: "Kanban Board" },
    { icon: CalendarDays, label: "Calendar" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Users, label: "Team" },
  ];

  const stats = [
    { label: "Total Tasks", value: "24", tone: "forest" },
    { label: "In Progress", value: "8", tone: "sage" },
    { label: "Completed", value: "14", tone: "forest" },
    { label: "Overdue", value: "2", tone: "warn" },
  ];

  const tasks = [
    { title: "Design onboarding flow", tag: "High", tone: "high", done: false },
    { title: "Review sprint backlog", tag: "Medium", tone: "med", done: false },
    { title: "Write release notes", tag: "Done", tone: "done", done: true },
    { title: "Update API documentation", tag: "Low", tone: "low", done: false },
  ];

  return (
    <div className="lp-preview" aria-hidden="true">
      <div className="lp-window">
        <div className="lp-window-bar">
          <span />
          <span />
          <span />
        </div>

        <div className="lp-app">
          {/* sidebar */}
          <div className="lp-app-side">
            <div className="lp-app-brand">
              <b>T</b>
              <span>TaskFlow</span>
            </div>

            {nav.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`lp-app-nav ${active ? "active" : ""}`}
              >
                <Icon size={14} strokeWidth={1.8} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* main */}
          <div className="lp-app-main">
            <div className="lp-app-head">
              <div>
                <small>Dashboard</small>
                <strong>Good morning</strong>
              </div>
              <div className="lp-app-btn">+ New Task</div>
            </div>

            <div className="lp-app-stats">
              {stats.map((s) => (
                <div key={s.label} className="lp-stat">
                  <i className={`dot ${s.tone}`} />
                  <small>{s.label}</small>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>

            <div className="lp-app-row">
              <div className="lp-card lp-ring-card">
                <small>Productivity</small>
                <div className="lp-ring">
                  <span>58%</span>
                </div>
              </div>

              <div className="lp-card lp-list-card">
                <small>Upcoming tasks</small>

                {tasks.map((t) => (
                  <div key={t.title} className="lp-task">
                    <span className={`lp-check ${t.done ? "on" : ""}`}>
                      {t.done && <Check size={9} strokeWidth={3} />}
                    </span>
                    <em className={t.done ? "struck" : ""}>{t.title}</em>
                    <b className={t.tone}>{t.tag}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lp-float lp-float-a">
        <span className="lp-float-icon">
          <Check size={14} strokeWidth={2.6} />
        </span>
        <div>
          <strong>Task completed</strong>
          <small>Write release notes</small>
        </div>
      </div>

      <div className="lp-float lp-float-b">
        <span className="lp-float-icon soft">
          <CalendarDays size={14} strokeWidth={2} />
        </span>
        <div>
          <strong>Due tomorrow</strong>
          <small>Review sprint backlog</small>
        </div>
      </div>
    </div>
  );
}


/* ---------------------------------------------------------
   PAGE
   --------------------------------------------------------- */

function Landing() {
  const { isAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (target) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToSection(target);
  };

  // Logged-in visitors see a Dashboard button; logged-out visitors see
  // Login + Get Started.
  const renderAuthActions = (stacked = false) =>
    isAuthenticated ? (
      <Link
        to="/dashboard"
        className="lp-btn lp-btn-primary"
        onClick={() => setMenuOpen(false)}
      >
        <LayoutDashboard size={16} strokeWidth={2} />
        Dashboard
      </Link>
    ) : (
      <>
        <Link
          to="/login"
          className={`lp-btn ${stacked ? "lp-btn-outline" : "lp-btn-ghost"}`}
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
        <Link
          to="/register"
          className="lp-btn lp-btn-primary"
          onClick={() => setMenuOpen(false)}
        >
          Get Started
        </Link>
      </>
    );

  return (
    <div className="lp" id="top">

      {/* ================= NAVBAR ================= */}
      <header className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-container lp-nav-inner">

          <Link to="/" className="lp-brand" onClick={go("top")}>
            <span className="lp-brand-mark">T</span>
            <span className="lp-brand-name">TaskFlow</span>
          </Link>

          <nav className="lp-nav-links" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a key={l.target} href={`#${l.target}`} onClick={go(l.target)}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="lp-nav-actions">
            {renderAuthActions()}
          </div>

          <button
            type="button"
            className="lp-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu">
            {NAV_LINKS.map((l) => (
              <a key={l.target} href={`#${l.target}`} onClick={go(l.target)}>
                {l.label}
              </a>
            ))}
            <div className="lp-mobile-actions">
              {renderAuthActions(true)}
            </div>
          </div>
        )}
      </header>


      <main>

        {/* ================= HERO ================= */}
        <section className="lp-hero">
          <div className="lp-container lp-hero-grid">

            <div className="lp-hero-copy">
              <span className="lp-pill">
                <i /> Tasks · Projects · Teams
              </span>

              <h1>
                Turn plans into <em>progress</em>, together.
              </h1>

              <p>
                TaskFlow brings your tasks, projects and teams into one calm
                workspace, with Kanban boards, a calendar and analytics to
                keep everyone moving in the same direction.
              </p>

              <div className="lp-hero-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="lp-btn lp-btn-primary lp-btn-lg">
                    Go to Dashboard
                    <ArrowRight size={17} strokeWidth={2} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="lp-btn lp-btn-primary lp-btn-lg">
                      Get Started
                      <ArrowRight size={17} strokeWidth={2} />
                    </Link>
                    <Link to="/login" className="lp-btn lp-btn-outline lp-btn-lg">
                      Login
                    </Link>
                  </>
                )}
              </div>

              <ul className="lp-hero-points">
                <li><Check size={15} strokeWidth={2.6} /> Kanban &amp; calendar views</li>
                <li><Check size={15} strokeWidth={2.6} /> Team workspaces</li>
                <li><Check size={15} strokeWidth={2.6} /> Progress analytics</li>
              </ul>
            </div>

            <DashboardPreview />
          </div>
        </section>


        {/* ================= FEATURES ================= */}
        <section className="lp-section" id="features">
          <div className="lp-container">
            <div className="lp-heading" data-reveal>
              <span className="lp-eyebrow">Features</span>
              <h2>Everything your team needs to stay on track</h2>
              <p>
                Six connected tools in one workspace, so work never gets lost
                between apps.
              </p>
            </div>

            <div className="lp-feature-grid">
              {FEATURES.map(({ icon: Icon, title, text }, i) => (
                <article
                  key={title}
                  className="lp-feature"
                  data-reveal
                  style={{ transitionDelay: `${(i % 3) * 70}ms` }}
                >
                  <span className="lp-feature-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>


        {/* ================= HOW IT WORKS ================= */}
        <section className="lp-section lp-how" id="how-it-works">
          <div className="lp-container">
            <div className="lp-heading lp-heading-light" data-reveal>
              <span className="lp-eyebrow">How It Works</span>
              <h2>From first team to finished work in four steps</h2>
              <p>A simple workflow that scales from a side project to a busy team.</p>
            </div>

            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="lp-step"
                  data-reveal
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="lp-step-num">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>


        {/* ================= ABOUT ================= */}
        <section className="lp-section" id="about">
          <div className="lp-container lp-about">
            <div data-reveal>
              <span className="lp-eyebrow">About</span>
              <h2>A calmer way to get work done</h2>
              <p>
                TaskFlow is a task and project management app for individuals
                and teams. It keeps planning, ownership and progress in one
                place, so you spend less time coordinating and more time
                finishing.
              </p>
              <p>
                From a quick personal to-do list to a multi-person project, the
                same simple workspace grows with you.
              </p>
            </div>

            <ul className="lp-principles" data-reveal>
              {PRINCIPLES.map((p) => (
                <li key={p}>
                  <span><Check size={14} strokeWidth={2.8} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>


        {/* ================= CTA ================= */}
        <section className="lp-cta-wrap">
          <div className="lp-container">
            <div className="lp-cta" data-reveal>
              <h2>
                {isAuthenticated
                  ? "Your workspace is ready when you are"
                  : "Ready to bring your work together?"}
              </h2>
              <p>
                {isAuthenticated
                  ? "Jump back in and pick up right where you left off."
                  : "Create your account and set up your first team, project and tasks in minutes."}
              </p>

              <div className="lp-cta-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="lp-btn lp-btn-light lp-btn-lg">
                    Open Dashboard
                    <ArrowRight size={17} strokeWidth={2} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="lp-btn lp-btn-light lp-btn-lg">
                      Get Started
                      <ArrowRight size={17} strokeWidth={2} />
                    </Link>
                    <Link to="/login" className="lp-btn lp-btn-ghost-light lp-btn-lg">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>


      {/* ================= FOOTER ================= */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">

            <div className="lp-footer-brand">
              <Link to="/" className="lp-brand lp-brand-light" onClick={go("top")}>
                <span className="lp-brand-mark">T</span>
                <span className="lp-brand-name">TaskFlow</span>
              </Link>
              <p>
                Tasks, projects and teams in one calm workspace.
              </p>
            </div>

            <div>
              <h4>Product</h4>
              <a href="#features" onClick={go("features")}>Features</a>
              <a href="#how-it-works" onClick={go("how-it-works")}>How It Works</a>
              <a href="#about" onClick={go("about")}>About</a>
            </div>

            <div>
              <h4>Account</h4>
              {isAuthenticated ? (
                <Link to="/dashboard">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Get Started</Link>
                </>
              )}
            </div>

            <div>
              <h4>Project</h4>
              <a
                href="https://github.com/Varshitailla11/Task-Management-App"
                target="_blank"
                rel="noreferrer"
              >
                Source on GitHub
              </a>
            </div>

          </div>

          <div className="lp-footer-bottom">
            <span>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Landing;
