import { useState } from "react";
import { X, CalendarDays } from "lucide-react";

import { TEAM_MEMBERS } from "../data/teamData";
import { PROJECT_OPTIONS } from "../data/projectData";

function CreateTaskModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    project: PROJECT_OPTIONS[0],
    assignee: TEAM_MEMBERS[0]?.name || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    onCreate({
      ...formData,
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="task-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >

        <div className="modal-header">

          <div>
            <h2>Create New Task</h2>

            <p>
              Add a new task to your workspace.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">

            <label htmlFor="title">
              Task Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />

          </div>

          {/* DESCRIPTION */}
          <div className="form-group">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe the task..."
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          {/* PRIORITY + STATUS */}
          <div className="form-row">

            <div className="form-group">

              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>
              </select>

            </div>

            <div className="form-group">

              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="To Do">
                  To Do
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>

            </div>

          </div>

          {/* DATE + PROJECT */}
          <div className="form-row">

            <div className="form-group">

              <label htmlFor="dueDate">
                Due Date
              </label>

              <div style={{ position: "relative" }}>

                <CalendarDays
                  size={15}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9aa2b0",
                    pointerEvents: "none",
                  }}
                />

                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: "36px" }}
                  value={formData.dueDate}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="project">
                Project
              </label>

              <select
                id="project"
                name="project"
                className="form-select"
                value={formData.project}
                onChange={handleChange}
              >
                {PROJECT_OPTIONS.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* ASSIGNEE */}
          <div className="form-group">

            <label htmlFor="assignee">
              Assignee
            </label>

            <select
              id="assignee"
              name="assignee"
              className="form-select"
              value={formData.assignee}
              onChange={handleChange}
            >
              {TEAM_MEMBERS.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>

          </div>

          {/* ACTIONS */}
          <div className="modal-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
            >
              Create Task
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateTaskModal;