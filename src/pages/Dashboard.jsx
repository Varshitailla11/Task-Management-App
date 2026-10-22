import { useState } from "react";

import {
  CheckSquare,
  Clock3,
  CircleCheck,
  Bell,
  Plus,
  CalendarDays,
  MoreHorizontal,
  FilePlus,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";

import { useTasks } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import CreateTaskModal from "../components/CreateTaskModal";

import {
  getGreeting,
  getFormattedToday,
  isOverdue,
  getCurrentWeekDates,
  WEEKDAY_LABELS,
  formatDate,
  getRelativeTime,
  isSameDate,
} from "../utils/dateUtils";

/* ---------------------------------------------------------
   Productivity message from a completion percentage
--------------------------------------------------------- */
function getProductivityMessage(percentage, totalTasks) {
  if (totalTasks === 0) {
    return "Create your first task to get started.";
  }

  if (percentage === 0) return "Let's get started!";
  if (percentage < 50) return "Good start!";
  if (percentage < 80) return "Great progress!";
  if (percentage < 100) return "Almost there!";

  return "Excellent work — everything's done!";
}

const ACTIVITY_ICONS = {
  created: FilePlus,
  completed: CheckSquare,
  "status-changed": ArrowRightLeft,
  deleted: Trash2,
};

function Dashboard() {
  const { tasks, activities, addTask } = useTasks();

  const { user } = useAuth();

  const [showCreateTask, setShowCreateTask] =
    useState(false);

  /* =====================================================
     CORE COUNTS — derived from tasks, never hardcoded
  ===================================================== */

  const totalTasks = tasks.length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const overdueTasks = tasks.filter(isOverdue).length;

  /* =====================================================
     PRODUCTIVITY
  ===================================================== */

  const productivity =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const productivityMessage =
    getProductivityMessage(
      productivity,
      totalTasks
    );

  /* =====================================================
     WEEKLY CHART
     Counts tasks completed on each day of the current
     (Mon–Sun) week.
  ===================================================== */

  const weekDates = getCurrentWeekDates();

  const completionsByDay = weekDates.map(
    (day) =>
      tasks.filter(
        (task) =>
          task.completedAt &&
          isSameDate(
            new Date(task.completedAt),
            day
          )
      ).length
  );

  const maxCompletions = Math.max(
    1,
    ...completionsByDay
  );

  /* =====================================================
     PROJECT PROGRESS
     Picks whichever project has the most tasks as the
     "current active project" for this widget.
  ===================================================== */

  const projectNames = Array.from(
    new Set(
      tasks
        .map((task) => task.project)
        .filter(Boolean)
    )
  );

  const activeProject = projectNames
    .map((name) => {
      const projectTasks = tasks.filter(
        (task) => task.project === name
      );

      return {
        name,
        count: projectTasks.length,
      };
    })
    .sort(
      (a, b) => b.count - a.count
    )[0];

  const activeProjectTasks = activeProject
    ? tasks.filter(
        (task) =>
          task.project ===
          activeProject.name
      )
    : [];

  const activeProjectCompleted =
    activeProjectTasks.filter(
      (task) =>
        task.status === "Completed"
    ).length;

  const activeProjectInProgress =
    activeProjectTasks.filter(
      (task) =>
        task.status === "In Progress"
    ).length;

  const activeProjectRemaining =
    activeProjectTasks.length -
    activeProjectCompleted;

  const activeProjectPercent =
    activeProjectTasks.length
      ? Math.round(
          (activeProjectCompleted /
            activeProjectTasks.length) *
            100
        )
      : 0;

  const projectInitials = activeProject
    ? activeProject.name
        .slice(0, 2)
        .toUpperCase()
    : "—";

  /* =====================================================
     UPCOMING TASKS
     Not completed, has a due date, sorted soonest first.
  ===================================================== */

  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.status !== "Completed" &&
        task.dueDate
    )
    .sort((a, b) =>
      a.dueDate.localeCompare(
        b.dueDate
      )
    )
    .slice(0, 5);

  /* =====================================================
     RECENT ACTIVITY
  ===================================================== */

  const recentActivities =
    activities.slice(0, 5);

  const handleCreateTask = (task) => {
    addTask(task);
    setShowCreateTask(false);
  };

  const greeting = getGreeting();
  const formattedToday =
    getFormattedToday();

  /*
    Get the logged-in user's name from AuthContext.

    If the name is unavailable for any reason,
    "there" is used as a safe fallback.
  */
  const userName =
    user?.name?.trim() || "there";

  return (
    <>
      <main className="content">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="welcome-section">

          <div>
            <p className="eyebrow">
              {formattedToday}
            </p>

            <h1>
              {greeting}, {userName} 👋
            </h1>

            <p className="welcome-text">
              Here's what's happening with
              your tasks today.
            </p>
          </div>

          <button
            type="button"
            className="create-button"
            onClick={() =>
              setShowCreateTask(true)
            }
          >
            <Plus size={17} />
            <span>New Task</span>
          </button>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <CheckSquare size={18} />
              </div>
            </div>

            <p className="stat-label">
              Total Tasks
            </p>

            <div className="stat-value">
              {totalTasks}
              <span>
                current tasks
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Clock3 size={18} />
              </div>
            </div>

            <p className="stat-label">
              In Progress
            </p>

            <div className="stat-value">
              {inProgressTasks}
              <span>
                active tasks
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <CircleCheck size={18} />
              </div>
            </div>

            <p className="stat-label">
              Completed
            </p>

            <div className="stat-value">
              {completedTasks}
              <span>
                finished tasks
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Bell size={18} />
              </div>

              <span
                className={
                  overdueTasks > 0
                    ? "stat-change danger-change"
                    : "stat-change"
                }
              >
                {overdueTasks > 0
                  ? "Attention"
                  : "Good"}
              </span>
            </div>

            <p className="stat-label">
              Overdue
            </p>

            <div className="stat-value">
              {String(
                overdueTasks
              ).padStart(2, "0")}
              <span>
                needs attention
              </span>
            </div>
          </div>

        </section>

        {/* =================================================
            MIDDLE SECTION
        ================================================= */}

        <section className="dashboard-grid">

          {/* PRODUCTIVITY */}
          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>
                  Productivity
                </h3>
                <p>
                  Your productivity
                  this week
                </p>
              </div>
            </div>

            <div className="productivity-content">

              <div className="productivity-score">
                <div>
                  <strong>
                    {productivity}%
                  </strong>
                  <span>
                    Score
                  </span>
                </div>
              </div>

              <div className="productivity-message">
                <strong>
                  {totalTasks === 0
                    ? "No tasks yet"
                    : "Keep it up!"}
                </strong>

                <p>
                  {productivityMessage}
                </p>
              </div>

              <div className="weekly-chart">

                <div className="chart-label">
                  Tasks
                </div>

                <div className="chart-bars">
                  {completionsByDay.map(
                    (
                      count,
                      index
                    ) => (
                      <span
                        key={
                          WEEKDAY_LABELS[
                            index
                          ]
                        }
                        style={{
                          height: `${Math.max(
                            8,
                            (count /
                              maxCompletions) *
                              100
                          )}%`,
                        }}
                      />
                    )
                  )}
                </div>

                <div className="chart-days">
                  {WEEKDAY_LABELS.map(
                    (label) => (
                      <span
                        key={label}
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* PROJECT PROGRESS */}
          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>
                  Project Progress
                </h3>

                <p>
                  Current active
                  project
                </p>
              </div>

              <button
                type="button"
                className="card-menu"
              >
                <MoreHorizontal
                  size={18}
                />
              </button>
            </div>

            {activeProject ? (
              <>
                <div className="project-info">

                  <div className="project-icon">
                    {projectInitials}
                  </div>

                  <div>
                    <strong>
                      {
                        activeProject.name
                      }
                    </strong>

                    <span>
                      {
                        activeProjectTasks.length
                      }{" "}
                      task
                      {activeProjectTasks.length ===
                      1
                        ? ""
                        : "s"}
                    </span>
                  </div>

                </div>

                <div className="progress-label">
                  <span>
                    Overall Progress
                  </span>

                  <strong>
                    {
                      activeProjectPercent
                    }
                    %
                  </strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${activeProjectPercent}%`,
                    }}
                  />
                </div>

                <div className="project-stats">

                  <div className="project-stat">
                    <strong>
                      {
                        activeProjectCompleted
                      }
                    </strong>

                    <span>
                      Completed
                    </span>
                  </div>

                  <div className="project-stat">
                    <strong>
                      {
                        activeProjectInProgress
                      }
                    </strong>

                    <span>
                      In Progress
                    </span>
                  </div>

                  <div className="project-stat">
                    <strong>
                      {
                        activeProjectRemaining
                      }
                    </strong>

                    <span>
                      Remaining
                    </span>
                  </div>

                </div>
              </>
            ) : (
              <div className="empty-state">
                <h3>
                  No projects yet
                </h3>

                <p>
                  Create a task with
                  a project to see
                  progress here.
                </p>
              </div>
            )}

          </div>

        </section>

        {/* =================================================
            BOTTOM SECTION
        ================================================= */}

        <section className="bottom-grid">

          {/* UPCOMING TASKS */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h3>
                  Upcoming Tasks
                </h3>

                <p>
                  Your latest tasks
                </p>
              </div>

              <CalendarDays
                size={18}
                className="card-muted-icon"
              />

            </div>

            <div className="task-list">

              {upcomingTasks.length ===
              0 ? (
                <div className="empty-state">

                  <h3>
                    Nothing upcoming
                  </h3>

                  <p>
                    Tasks with due
                    dates will show
                    up here.
                  </p>

                </div>
              ) : (
                upcomingTasks.map(
                  (task) => (
                    <div
                      className="task-row"
                      key={task.id}
                    >

                      <div className="task-row-left">

                        <div
                          className={
                            task.status ===
                            "Completed"
                              ? "task-check completed"
                              : "task-check"
                          }
                        >
                          {task.status ===
                            "Completed" && (
                            <CheckSquare
                              size={11}
                            />
                          )}
                        </div>

                        <div>

                          <div className="task-row-title">
                            {
                              task.title
                            }
                          </div>

                          <div className="task-row-meta">
                            {task.project ||
                              "No project"}
                          </div>

                        </div>

                      </div>

                      <div className="task-row-date">
                        {formatDate(
                          task.dueDate
                        )}
                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>

          {/* RECENT ACTIVITY */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h3>
                  Recent Activity
                </h3>

                <p>
                  Latest workspace
                  updates
                </p>
              </div>

              <Bell
                size={17}
                className="card-muted-icon"
              />

            </div>

            <div className="activity-list">

              {recentActivities.length ===
              0 ? (
                <div className="empty-state">

                  <h3>
                    No activity yet
                  </h3>

                  <p>
                    Actions you take
                    will show up here.
                  </p>

                </div>
              ) : (
                recentActivities.map(
                  (activity) => {
                    const Icon =
                      ACTIVITY_ICONS[
                        activity.type
                      ] ||
                      FilePlus;

                    return (
                      <div
                        className="activity-item"
                        key={
                          activity.id
                        }
                      >

                        <div className="activity-icon">
                          <Icon
                            size={14}
                          />
                        </div>

                        <div>
                          <strong>
                            {
                              activity.message
                            }
                          </strong>
                        </div>

                        <small>
                          {getRelativeTime(
                            activity.timestamp
                          )}
                        </small>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>

        </section>

      </main>

      {showCreateTask && (
        <CreateTaskModal
          onClose={() =>
            setShowCreateTask(false)
          }
          onCreate={
            handleCreateTask
          }
        />
      )}

    </>
  );
}

export default Dashboard;