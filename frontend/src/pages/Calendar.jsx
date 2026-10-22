import { useState } from "react";

import { useTasks } from "../context/TaskContext";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskDetailsModal from "../components/TaskDetailsModal";

import {
  parseDateOnly,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  isSameDate,
} from "../utils/dateUtils";

function Calendar() {
  const { tasks, addTask } = useTasks();

  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    today.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    today.getFullYear()
  );

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleCreateTask = (task) => {
    addTask(task);
    setShowCreateModal(false);
  };

  /* =====================================================
     MONTH LABEL — e.g. "September 2026"
  ===================================================== */

  const monthLabel = new Date(
    currentYear,
    currentMonth
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(
    currentYear,
    currentMonth
  );

  const firstWeekday = getFirstWeekdayOfMonth(
    currentYear,
    currentMonth
  );

  const isViewingCurrentMonth =
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isToday = (day) =>
    isViewingCurrentMonth && day === today.getDate();

  /* =====================================================
     TASKS PER DAY — real due dates, no hardcoded events
  ===================================================== */

  const getTasksForDay = (day) => {
    const cellDate = new Date(
      currentYear,
      currentMonth,
      day
    );

    return tasks.filter((task) => {
      if (!task.dueDate) return false;

      const due = parseDateOnly(task.dueDate);

      return due && isSameDate(due, cellDate);
    });
  };

  const leadingBlanks = Array.from(
    { length: firstWeekday },
    (_, index) => (
      <div
        className="calendar-day empty"
        key={`blank-${index}`}
      />
    )
  );

  const dayCells = Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;
      const dayTasks = getTasksForDay(day);

      return (
        <div
          className={`calendar-day ${
            isToday(day) ? "today" : ""
          }`}
          key={day}
        >
          <span>{day}</span>

          {dayTasks.slice(0, 3).map((task) => (
            <small
              key={task.id}
              className={
                task.status === "Completed"
                  ? "completed-task"
                  : ""
              }
              onClick={() => setSelectedTask(task)}
              title={task.title}
            >
              {task.title}
            </small>
          ))}
        </div>
      );
    }
  );

  return (
    <section className="page-content">

      <div className="page-heading">
        <div>
          <p className="eyebrow">SCHEDULE</p>
          <h1>Calendar</h1>
          <p>Keep track of your deadlines and upcoming tasks.</p>
        </div>

        <button
          type="button"
          className="create-button"
          onClick={() => setShowCreateModal(true)}
        >
          <span>+</span>
          New Task
        </button>
      </div>

      <div className="calendar-panel">

        <div className="calendar-header">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            ←
          </button>

          <h2>{monthLabel}</h2>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {!isViewingCurrentMonth && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <button
              type="button"
              className="week-button"
              onClick={goToToday}
            >
              Back to Today
            </button>
          </div>
        )}

        <div className="calendar-weekdays">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {leadingBlanks}
          {dayCells}
        </div>

      </div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

    </section>
  );
}

export default Calendar;