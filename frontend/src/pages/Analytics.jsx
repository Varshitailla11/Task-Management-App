import { useTasks } from "../context/TaskContext";

import {
  isOverdue,
  getCurrentWeekDates,
  WEEKDAY_LABELS,
  isSameDate,
} from "../utils/dateUtils";

function Analytics() {
  const { tasks } = useTasks();

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "To Do"
  ).length;

  const overdueTasks = tasks.filter(isOverdue).length;

  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  /* weekly completions — same logic as the Dashboard chart */

  const weekDates = getCurrentWeekDates();

  const completionsByDay = weekDates.map((day) =>
    tasks.filter(
      (task) =>
        task.completedAt &&
        isSameDate(new Date(task.completedAt), day)
    ).length
  );

  const maxCompletions = Math.max(1, ...completionsByDay);

  /* average time-to-complete, in days */

  const completedWithTimestamps = tasks.filter(
    (task) => task.completedAt && task.createdAt
  );

  const averageCompletionDays = completedWithTimestamps.length
    ? (
        completedWithTimestamps.reduce((total, task) => {
          const created = new Date(task.createdAt);
          const completed = new Date(task.completedAt);

          const diffDays =
            (completed.getTime() - created.getTime()) /
            (1000 * 60 * 60 * 24);

          return total + diffDays;
        }, 0) / completedWithTimestamps.length
      ).toFixed(1)
    : null;

  return (
    <section className="page-content">

      <div className="page-heading">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h1>Analytics</h1>
          <p>Understand your productivity and task performance.</p>
        </div>
      </div>

      <div className="analytics-stats">

        <div className="analytics-card">
          <span>Completion Rate</span>
          <strong>{completionRate}%</strong>
          <small>
            {completedTasks} of {totalTasks} tasks
          </small>
        </div>

        <div className="analytics-card">
          <span>Tasks Completed</span>
          <strong>{completedTasks}</strong>
          <small>All time</small>
        </div>

        <div className="analytics-card">
          <span>In Progress</span>
          <strong>{inProgressTasks}</strong>
          <small>Currently active</small>
        </div>

        <div className="analytics-card">
          <span>Overdue</span>
          <strong>{overdueTasks}</strong>
          <small>
            {overdueTasks > 0 ? "Needs attention" : "All clear"}
          </small>
        </div>

      </div>

      {totalTasks === 0 ? (
        <div className="empty-state">
          <h3>No data yet</h3>
          <p>Create a task to start seeing analytics here.</p>
        </div>
      ) : (
        <div className="analytics-main">

          <div className="panel analytics-chart">
            <h2>Weekly Task Completion</h2>

            <div className="big-chart">
              {completionsByDay.map((count, index) => (
                <div
                  className="big-bar"
                  style={{
                    height: `${Math.max(
                      6,
                      (count / maxCompletions) * 100
                    )}%`,
                  }}
                  key={WEEKDAY_LABELS[index]}
                >
                  <span>{WEEKDAY_LABELS[index].charAt(0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel productivity-summary">
            <h2>Productivity Summary</h2>

            <div className="summary-row">
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

            <div className="summary-row">
              <span>In Progress</span>
              <strong>{inProgressTasks}</strong>
            </div>

            <div className="summary-row">
              <span>To Do</span>
              <strong>{todoTasks}</strong>
            </div>

            <div className="summary-row">
              <span>Overdue</span>
              <strong>{overdueTasks}</strong>
            </div>

            <div className="summary-row">
              <span>Average completion</span>
              <strong>
                {averageCompletionDays
                  ? `${averageCompletionDays} days`
                  : "—"}
              </strong>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default Analytics;