import { useState } from "react";

import { useTasks } from "../context/TaskContext";
import TaskDetailsModal from "../components/TaskDetailsModal";

const COLUMNS = ["To Do", "In Progress", "Completed"];

function Kanban() {
  const { tasks } = useTasks();

  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <section className="page-content">

      <div className="page-heading">
        <div>
          <p className="eyebrow">PROJECT BOARD</p>
          <h1>Kanban Board</h1>
          <p>Visualize and manage your workflow.</p>
        </div>
      </div>

      <div className="kanban-board">

        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter(
            (task) => task.status === status
          );

          return (
            <div className="kanban-column" key={status}>

              <div className="kanban-column-header">
                <h3>{status}</h3>
                <span>{columnTasks.length}</span>
              </div>

              <div className="kanban-tasks">

                {columnTasks.length === 0 ? (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "11px",
                      padding: "4px 2px 12px",
                    }}
                  >
                    No tasks here yet.
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      className="kanban-card"
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      role="button"
                      tabIndex={0}
                    >
                      <h4>{task.title}</h4>

                      <div className="kanban-card-footer">
                        <span>
                          {task.project || "No project"}
                        </span>

                        <div className="mini-avatar">
                          {(task.assignee || "M")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))
                )}

              </div>

            </div>
          );
        })}

      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

    </section>
  );
}

export default Kanban;