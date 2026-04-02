import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

type Project = {
  _id: string;
  name: string;
  description: string;
};

const Dashboard = () => {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects");
        console.log("GET PROJECTS RESPONSE:", response.data);

        const projectList = Array.isArray(response.data)
          ? response.data
          : response.data.projects || [];

        setProjects(projectList);
      } catch (err: any) {
        console.log("GET PROJECTS ERROR:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const response = await api.post("/api/projects", formData);
      console.log("CREATE PROJECT RESPONSE:", response.data);

      const createdProject = response.data.project || response.data;

      setProjects((prevProjects) => [createdProject, ...prevProjects]);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      console.log("CREATE PROJECT ERROR:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create project"
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.username}</p>

      <h2>Create Project</h2>

      <form onSubmit={handleCreateProject}>
        <div>
          <label>Project Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Project"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <h2>Your Projects</h2>

      {!error && projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project._id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <Link to={`/projects/${project._id}`}>View Project</Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;