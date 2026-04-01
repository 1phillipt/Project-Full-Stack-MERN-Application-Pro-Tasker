import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

type Project = {
  _id: string;
  name: string;
  description: string;
};

type Task = {
  _id: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done";
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingProject, setUpdatingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/projects/${id}/tasks`),
        ]);

        setProject(projectRes.data);
        setProjectForm({
          name: projectRes.data.name,
          description: projectRes.data.description,
        });
        setTasks(tasksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [id]);

  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProjectForm({
      ...projectForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setUpdatingProject(true);

    try {
      const response = await api.put(`/api/projects/${id}`, projectForm);
      setProject(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setError("");
    setDeletingProject(true);

    try {
      await api.delete(`/api/projects/${id}`);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingProject(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCreatingTask(true);

    try {
      const response = await api.post(`/api/projects/${id}/tasks`, {
        ...taskForm,
        status: "To Do",
      });

      setTasks((prevTasks) => [response.data, ...prevTasks]);
      setTaskForm({ title: "", description: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: "To Do" | "In Progress" | "Done"
  ) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? response.data : task))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error && !project) {
    return (
      <div>
        <p>{error}</p>
        <Link to="/">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/">← Back to Dashboard</Link>

      {error && <p>{error}</p>}

      <h1>Project Details</h1>

      <form onSubmit={handleUpdateProject}>
        <div>
          <label>Project Name</label>
          <input
            type="text"
            name="name"
            value={projectForm.name}
            onChange={handleProjectChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={projectForm.description}
            onChange={handleProjectChange}
          />
        </div>

        <button type="submit" disabled={updatingProject}>
          {updatingProject ? "Saving..." : "Update Project"}
        </button>

        <button
          type="button"
          onClick={handleDeleteProject}
          disabled={deletingProject}
        >
          {deletingProject ? "Deleting..." : "Delete Project"}
        </button>
      </form>

      <h2>Create Task</h2>

      <form onSubmit={handleCreateTask}>
        <div>
          <label>Task Title</label>
          <input
            type="text"
            name="title"
            value={taskForm.title}
            onChange={handleTaskChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={taskForm.description}
            onChange={handleTaskChange}
          />
        </div>

        <button type="submit" disabled={creatingTask}>
          {creatingTask ? "Creating..." : "Create Task"}
        </button>
      </form>

      <h2>Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <div key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <label>Status: </label>
            <select
              value={task.status}
              onChange={(e) =>
                handleStatusChange(
                  task._id,
                  e.target.value as "To Do" | "In Progress" | "Done"
                )
              }
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <div>
              <button type="button" onClick={() => handleDeleteTask(task._id)}>
                Delete Task
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectDetails;