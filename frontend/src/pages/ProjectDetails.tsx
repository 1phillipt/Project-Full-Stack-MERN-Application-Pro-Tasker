import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

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
        setTasks(tasksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [id]);

  const handleTaskChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
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

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error) {
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

      <h1>{project?.name}</h1>
      <p>{project?.description}</p>

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
            <p>Status: {task.status}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectDetails;