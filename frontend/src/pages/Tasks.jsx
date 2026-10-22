import { useEffect, useState } from "react";

import {
  Search,
  Plus,
  Check,
  Trash2,
  User,
  CalendarDays,
  X,
} from "lucide-react";

import { useTasks } from "../context/TaskContext";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { formatDate } from "../utils/dateUtils";
import { getToken } from "../services/authService";

function Tasks() {
  const {
    tasks,
    addTask,
    deleteTask,
    updateTask,
  } = useTasks();

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  // =====================================================
  // REAL PROJECTS + MEMBERS
  // =====================================================

  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] =
    useState([]);

  const [projectsLoading, setProjectsLoading] =
    useState(false);

  const [membersLoading, setMembersLoading] =
    useState(false);

  const [projectError, setProjectError] =
    useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_URL.replace(
      /\/tasks\/?$/,
      ""
    );

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "To Do",
    dueDate: "",
    projectId: "",
    project: "",
    assignedTo: "",
    assignee: "",
  });

  // =====================================================
  // LOAD REAL PROJECTS
  // =====================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectError("");

        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch projects"
          );
        }

        setProjects(data);

        // Automatically select the first project
        if (data.length > 0) {
          setFormData((previous) => ({
            ...previous,
            projectId: data[0]._id,
            project: data[0].name,
          }));
        }
      } catch (error) {
        console.error(
          "Fetch projects error:",
          error
        );

        setProjectError(
          error.message ||
            "Failed to load projects"
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [API_BASE_URL]);

  // =====================================================
  // LOAD PROJECT MEMBERS
  // =====================================================

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!formData.projectId) {
        setProjectMembers([]);
        return;
      }

      try {
        setMembersLoading(true);

        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/projects/${formData.projectId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch project members"
          );
        }

        setProjectMembers(data);

        // Automatically select first member
        if (data.length > 0) {
          setFormData((previous) => ({
            ...previous,
            assignedTo: data[0].id,
            assignee: data[0].name,
          }));
        } else {
          setFormData((previous) => ({
            ...previous,
            assignedTo: "",
            assignee: "",
          }));
        }
      } catch (error) {
        console.error(
          "Fetch project members error:",
          error
        );

        setProjectMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchProjectMembers();
  }, [formData.projectId, API_BASE_URL]);

  // =====================================================
  // FILTER + SEARCH
  // =====================================================

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "All" || task.status === filter;

    const searchText =
      search.toLowerCase().trim();

    const searchableFields = [
      task.title,
      task.description,
      task.project,
      task.assignee,
      task.status,
      task.priority,
    ];

    const matchesSearch =
      searchText === "" ||
      searchableFields.some((field) =>
        (field || "")
          .toLowerCase()
          .includes(searchText)
      );

    return matchesFilter && matchesSearch;
  });

  const hasAnyTasks = tasks.length > 0;

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    // Project changed
    if (name === "projectId") {
      const selectedProject =
        projects.find(
          (project) =>
            project._id === value
        );

      setFormData((previous) => ({
        ...previous,
        projectId: value,
        project:
          selectedProject?.name || "",
        assignedTo: "",
        assignee: "",
      }));

      return;
    }

    // Assignee changed
    if (name === "assignedTo") {
      const selectedMember =
        projectMembers.find(
          (member) =>
            member.id === value
        );

      setFormData((previous) => ({
        ...previous,
        assignedTo: value,
        assignee:
          selectedMember?.name || "",
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE TASK
  // =====================================================

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!formData.projectId) {
      alert("Please select a project.");
      return;
    }

    if (!formData.assignedTo) {
      alert("Please select an assignee.");
      return;
    }

    try {
      await addTask({
        ...formData,
      });

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "To Do",
        dueDate: "",
        projectId:
          projects[0]?._id || "",
        project:
          projects[0]?.name || "",
        assignedTo:
          projectMembers[0]?.id || "",
        assignee:
          projectMembers[0]?.name || "",
      });

      setShowCreateModal(false);
    } catch (error) {
      alert(
        error.message ||
          "Failed to create task."
      );
    }
  };

  // =====================================================
  // COMPLETE TASK
  // =====================================================

  const handleComplete = (
    event,
    task
  ) => {
    event.stopPropagation();

    updateTask(task.id, {
      status:
        task.status === "Completed"
          ? "To Do"
          : "Completed",
    });
  };

  // =====================================================
  // DELETE TASK
  // =====================================================

  const handleDelete = (
    event,
    id
  ) => {
    event.stopPropagation();

    deleteTask(id);

    if (
      selectedTask &&
      selectedTask.id === id
    ) {
      setSelectedTask(null);
    }
  };

  // =====================================================
  // OPEN DETAILS
  // =====================================================

  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  return (
    <section className="page-content">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="welcome-section">
        <div>
          <p className="eyebrow">
            TASK MANAGEMENT
          </p>

          <h1>My Tasks</h1>

          <p className="welcome-text">
            Manage and organize everything
            you need to get done.
          </p>
        </div>

        <button
          type="button"
          className="create-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          <Plus size={17} />
          New Task
        </button>
      </div>

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

      <div className="task-toolbar">

        <div className="task-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="filters">
          {[
            "All",
            "To Do",
            "In Progress",
            "Completed",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className={
                filter === item
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setFilter(item)
              }
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================
          TASK LIST
      ================================================= */}

      <div className="tasks-page-list">

        {filteredTasks.length === 0 ? (
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>
                  {hasAnyTasks
                    ? "No tasks found"
                    : "No tasks yet"}
                </h3>

                <p>
                  {hasAnyTasks
                    ? "Try changing your search or filter."
                    : "Create your first task to get started."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="task-card"
              onClick={() =>
                openTaskDetails(task)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key === " "
                ) {
                  openTaskDetails(task);
                }
              }}
            >

              <button
                type="button"
                className={`complete-task ${
                  task.status ===
                  "Completed"
                    ? "completed"
                    : ""
                }`}
                onClick={(event) =>
                  handleComplete(
                    event,
                    task
                  )
                }
                title={
                  task.status ===
                  "Completed"
                    ? "Mark as incomplete"
                    : "Mark as completed"
                }
              >
                {task.status ===
                  "Completed" && (
                  <Check size={12} />
                )}
              </button>

              <div className="task-card-content">

                <h3 className="task-card-title">
                  {task.title}
                </h3>

                <p className="task-card-description">
                  {task.description ||
                    "No description added."}
                </p>

                <div className="task-card-meta">

                  <span className="task-project">
                    {task.project ||
                      "No project"}
                  </span>

                  <span
                    className={`task-status ${
                      task.status
                        ?.toLowerCase()
                        .replace(
                          /\s+/g,
                          "-"
                        )
                    }`}
                  >
                    {task.status}
                  </span>

                  <span className="task-priority">
                    {task.priority ||
                      "Medium"}
                  </span>

                </div>
              </div>

              <div className="task-card-right">

                <div className="task-assignee">
                  <span>
                    Assignee
                  </span>

                  <strong>
                    <User size={13} />
                    {task.assignee ||
                      "Unassigned"}
                  </strong>
                </div>

                <div className="task-due-date">
                  <span>
                    Due
                  </span>

                  <strong>
                    <CalendarDays
                      size={13}
                    />
                    {formatDate(
                      task.dueDate
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={(event) =>
                    handleDelete(
                      event,
                      task.id
                    )
                  }
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>

              </div>
            </div>
          ))
        )}

      </div>

      {/* =================================================
          CREATE TASK MODAL
      ================================================= */}

      {showCreateModal && (
        <div
          className="modal-overlay"
          onMouseDown={() =>
            setShowCreateModal(false)
          }
        >
          <div
            className="task-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  Create New Task
                </h2>

                <p>
                  Add a new task to your
                  workspace.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateTask
              }
            >

              {/* TITLE */}

              <div className="form-group">

                <label>
                  Task Title
                </label>

                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. Complete dashboard design"
                  autoFocus
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  className="form-textarea"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Describe what needs to be done..."
                  rows="4"
                />

              </div>

              {/* PRIORITY + STATUS */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    className="form-select"
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleFormChange
                    }
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

                  <label>
                    Status
                  </label>

                  <select
                    className="form-select"
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleFormChange
                    }
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

              {/* DUE DATE + PROJECT */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Due Date
                  </label>

                  <div className="input-with-icon">

                    <CalendarDays
                      size={16}
                    />

                    <input
                      className="form-input"
                      type="date"
                      name="dueDate"
                      value={
                        formData.dueDate
                      }
                      onChange={
                        handleFormChange
                      }
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Project
                  </label>

                  <select
                    className="form-select"
                    name="projectId"
                    value={
                      formData.projectId
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      projectsLoading
                    }
                  >

                    {projectsLoading ? (
                      <option>
                        Loading projects...
                      </option>
                    ) : projects.length ===
                      0 ? (
                      <option value="">
                        No projects available
                      </option>
                    ) : (
                      projects.map(
                        (project) => (
                          <option
                            key={
                              project._id
                            }
                            value={
                              project._id
                            }
                          >
                            {project.name}
                          </option>
                        )
                      )
                    )}

                  </select>

                  {projectError && (
                    <small
                      style={{
                        color:
                          "#dc2626",
                        marginTop:
                          "6px",
                        display:
                          "block",
                      }}
                    >
                      {projectError}
                    </small>
                  )}

                </div>

              </div>

              {/* ASSIGNEE */}

              <div className="form-group">

                <label>
                  Assignee
                </label>

                <select
                  className="form-select"
                  name="assignedTo"
                  value={
                    formData.assignedTo
                  }
                  onChange={
                    handleFormChange
                  }
                  disabled={
                    membersLoading ||
                    !formData.projectId
                  }
                >

                  {membersLoading ? (
                    <option>
                      Loading project members...
                    </option>
                  ) : projectMembers.length ===
                    0 ? (
                    <option value="">
                      No project members
                    </option>
                  ) : (
                    projectMembers.map(
                      (member) => (
                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >
                          {member.name}
                        </option>
                      )
                    )
                  )}

                </select>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowCreateModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={
                    projectsLoading ||
                    membersLoading ||
                    projects.length ===
                      0 ||
                    projectMembers.length ===
                      0
                  }
                >
                  Create Task
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* =================================================
          TASK DETAILS MODAL
      ================================================= */}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() =>
            setSelectedTask(null)
          }
        />
      )}

    </section>
  );
}

export default Tasks;