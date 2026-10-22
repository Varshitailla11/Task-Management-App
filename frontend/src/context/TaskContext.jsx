import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { apiRequest } from "../services/api";

const TaskContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

const ACTIVITIES_API_URL = API_URL.replace(
  /\/tasks\/?$/,
  "/activities"
);

const frontendToBackendStatus = (status) => {
  switch (status) {
    case "To Do":
      return "todo";
    case "In Progress":
      return "in-progress";
    case "Completed":
      return "completed";
    default:
      return "todo";
  }
};

const backendToFrontendStatus = (status) => {
  switch (status) {
    case "todo":
      return "To Do";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "To Do";
  }
};

const frontendToBackendPriority = (priority) => {
  switch (priority) {
    case "Low":
      return "low";
    case "High":
      return "high";
    case "Medium":
    default:
      return "medium";
  }
};

const convertBackendTask = (task) => {
  return {
    id: task._id,
    title: task.title || "",
    description: task.description || "",
    status: backendToFrontendStatus(
      task.status
    ),
    priority:
      task.priority === "low"
        ? "Low"
        : task.priority === "high"
        ? "High"
        : "Medium",
    dueDate: task.dueDate
      ? task.dueDate.split("T")[0]
      : "",
    assignee: task.assignee || "Me",
    project: task.project || "TaskFlow",
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt:
      task.status === "completed"
        ? task.updatedAt
        : null,
  };
};

const convertBackendActivity = (activity) => {
  return {
    id: activity._id,
    type: activity.type,
    message: activity.message,
    timestamp:
      activity.createdAt ||
      activity.updatedAt ||
      new Date().toISOString(),
  };
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from MongoDB
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const data = await apiRequest(
          API_URL
        );

        const convertedTasks =
          data.map(convertBackendTask);

        setTasks(convertedTasks);
      } catch (error) {
        console.error(
          "Failed to load tasks:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Load activities from MongoDB
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await apiRequest(
          ACTIVITIES_API_URL
        );

        const convertedActivities =
          data.map(convertBackendActivity);

        setActivities(convertedActivities);
      } catch (error) {
        console.error(
          "Failed to load activities:",
          error
        );
      }
    };

    fetchActivities();
  }, []);

  const addActivity = async (
    type,
    message
  ) => {
    try {
      const createdActivity =
        await apiRequest(
          ACTIVITIES_API_URL,
          {
            method: "POST",
            body: JSON.stringify({
              type,
              message,
            }),
          }
        );

      const newActivity =
        convertBackendActivity(
          createdActivity
        );

      setActivities((previous) => [
        newActivity,
        ...previous,
      ]);

      return newActivity;
    } catch (error) {
      console.error(
        "Failed to create activity:",
        error
      );
    }
  };

  const addTask = async (taskInput) => {
    try {
      const backendTask = {
        title: taskInput.title,
        description:
          taskInput.description || "",
      
        status: frontendToBackendStatus(
          taskInput.status || "To Do"
        ),
      
        priority: frontendToBackendPriority(
          taskInput.priority || "Medium"
        ),
      
        dueDate: taskInput.dueDate
          ? taskInput.dueDate
          : null,
      
        // Display values
        assignee:
          taskInput.assignee || "Me",
      
        project:
          taskInput.project || "TaskFlow",
      
        // Real database relationships
        teamId:
          taskInput.teamId || null,
      
        projectId:
          taskInput.projectId || null,
      
        assignedTo:
          taskInput.assignedTo || null,
      };

      const createdTask =
        await apiRequest(
          API_URL,
          {
            method: "POST",
            body: JSON.stringify(
              backendTask
            ),
          }
        );

      const newTask =
        convertBackendTask(
          createdTask
        );

      setTasks((previous) => [
        ...previous,
        newTask,
      ]);

      addActivity(
        "created",
        `"${newTask.title}" was created`
      );

      return newTask;
    } catch (error) {
      console.error(
        "Failed to create task:",
        error
      );

      throw error;
    }
  };

  const updateTask = async (
    id,
    updates
  ) => {
    try {
      const backendUpdates = {};

      if ("title" in updates) {
        backendUpdates.title =
          updates.title;
      }

      if ("description" in updates) {
        backendUpdates.description =
          updates.description;
      }

      if ("status" in updates) {
        backendUpdates.status =
          frontendToBackendStatus(
            updates.status
          );
      }

      if ("priority" in updates) {
        backendUpdates.priority =
          frontendToBackendPriority(
            updates.priority
          );
      }

      if ("dueDate" in updates) {
        backendUpdates.dueDate =
          updates.dueDate || null;
      }

      if ("assignee" in updates) {
        backendUpdates.assignee =
          updates.assignee;
      }

      if ("project" in updates) {
        backendUpdates.project =
          updates.project;
      }

      const updatedBackendTask =
        await apiRequest(
          `${API_URL}/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(
              backendUpdates
            ),
          }
        );

      const updatedTask =
        convertBackendTask(
          updatedBackendTask
        );

      setTasks((previous) =>
        previous.map((task) =>
          task.id === id
            ? updatedTask
            : task
        )
      );

      const previousTask = tasks.find(
        (task) => task.id === id
      );

      if (
        previousTask &&
        "status" in updates &&
        updates.status !==
          previousTask.status
      ) {
        if (
          updates.status ===
          "Completed"
        ) {
          addActivity(
            "completed",
            `"${previousTask.title}" was marked completed`
          );
        } else {
          addActivity(
            "status-changed",
            `"${previousTask.title}" moved to ${updates.status}`
          );
        }
      }

      return updatedTask;
    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );

      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      const target = tasks.find(
        (task) => task.id === id
      );

      await apiRequest(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      setTasks((previous) =>
        previous.filter(
          (task) => task.id !== id
        )
      );

      if (target) {
        addActivity(
          "deleted",
          `"${target.title}" was deleted`
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      throw error;
    }
  };

  const value = {
    tasks,
    activities,
    loading,
    addTask,
    updateTask,
    deleteTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTasks must be used within a TaskProvider"
    );
  }

  return context;
}