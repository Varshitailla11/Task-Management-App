import { useEffect, useState } from "react";

import {
  X,
  FolderKanban,
  Flag,
  CircleCheck,
  User,
  CalendarDays,
  Pencil,
} from "lucide-react";

import { useTasks } from "../context/TaskContext";
import { formatDate } from "../utils/dateUtils";
import { TEAM_MEMBERS } from "../data/teamData";
import { PROJECT_OPTIONS } from "../data/projectData";

/* =========================================================
   SHARED TASK DETAILS MODAL

   Used by both Tasks and Calendar pages.

   Supports:
   - Viewing task details
   - Editing task details
   - Saving changes to MongoDB
   ========================================================= */

function TaskDetailsModal({ task, onClose }) {
  const { updateTask } = useTasks();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    project: "TaskFlow",
    assignee: "Me",
  });

  const [saving, setSaving] = useState(false);

  /* =======================================================
     LOAD TASK INTO FORM
  ======================================================= */

  useEffect(() => {
    if (!task) return;

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      dueDate: task.dueDate || "",
      project: task.project || PROJECT_OPTIONS[0],
      assignee:
        task.assignee ||
        TEAM_MEMBERS[0]?.name ||
        "Me",
    });
  }, [task]);

  if (!task) return null;

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     START EDITING
  ======================================================= */

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  const handleCancelEditing = () => {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "To Do",
      dueDate: task.dueDate || "",
      project: task.project || PROJECT_OPTIONS[0],
      assignee:
        task.assignee ||
        TEAM_MEMBERS[0]?.name ||
        "Me",
    });

    setIsEditing(false);
  };

  /* =======================================================
     SAVE CHANGES
  ======================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      setSaving(true);

      await updateTask(task.id, {
        title: formData.title.trim(),
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        project: formData.project,
        assignee: formData.assignee,
      });

      setIsEditing(false);
    } catch (error) {
      alert("Failed to update task. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="task-details-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {isEditing
                ? "EDIT TASK"
                : "TASK DETAILS"}
            </p>

            {!isEditing ? (
              <h2 className="task-details-title">
                {task.title}
              </h2>
            ) : (
              <h2 className="task-details-title">
                Edit Task
              </h2>
            )}
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            VIEW MODE
        ================================================= */}

        {!isEditing && (
          <>
            <div className="task-details-description">
              <strong>Description</strong>

              <p>
                {task.description ||
                  "No description has been added for this task."}
              </p>
            </div>

            <div className="task-details-grid">

              <div className="task-detail-item">
                <div className="task-detail-icon">
                  <FolderKanban size={16} />
                </div>

                <div>
                  <span>Project</span>
                  <strong>
                    {task.project || "No project"}
                  </strong>
                </div>
              </div>

              <div className="task-detail-item">
                <div className="task-detail-icon">
                  <Flag size={16} />
                </div>

                <div>
                  <span>Priority</span>
                  <strong>
                    {task.priority || "Medium"}
                  </strong>
                </div>
              </div>

              <div className="task-detail-item">
                <div className="task-detail-icon">
                  <CircleCheck size={16} />
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {task.status || "To Do"}
                  </strong>
                </div>
              </div>

              <div className="task-detail-item">
                <div className="task-detail-icon">
                  <User size={16} />
                </div>

                <div>
                  <span>Assignee</span>
                  <strong>
                    {task.assignee || "Me"}
                  </strong>
                </div>
              </div>

              <div className="task-detail-item">
                <div className="task-detail-icon">
                  <CalendarDays size={16} />
                </div>

                <div>
                  <span>Due Date</span>
                  <strong>
                    {formatDate(task.dueDate)}
                  </strong>
                </div>
              </div>

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
              >
                Close
              </button>

              <button
                type="button"
                className="save-button"
                onClick={handleStartEditing}
              >
                <Pencil size={15} />
                Edit Task
              </button>

            </div>
          </>
        )}

        {/* =================================================
            EDIT MODE
        ================================================= */}

        {isEditing && (
          <form onSubmit={handleSave}>

            <div className="form-group">
              <label>Task Title</label>

              <input
                className="form-input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                className="form-textarea"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="4"
              />
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Priority</label>

                <select
                  className="form-select"
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
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

            <div className="form-row">

              <div className="form-group">
                <label>Due Date</label>

                <div className="input-with-icon">
                  <CalendarDays size={16} />

                  <input
                    className="form-input"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Project</label>

                <select
                  className="form-select"
                  name="project"
                  value={formData.project}
                  onChange={handleFormChange}
                >
                  {PROJECT_OPTIONS.map(
                    (project) => (
                      <option
                        key={project}
                        value={project}
                      >
                        {project}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Assignee</label>

              <select
                className="form-select"
                name="assignee"
                value={formData.assignee}
                onChange={handleFormChange}
              >
                {TEAM_MEMBERS.map(
                  (member) => (
                    <option
                      key={member.id}
                      value={member.name}
                    >
                      {member.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEditing}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}

export default TaskDetailsModal;