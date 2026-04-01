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
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects");
        setProjects(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading projects...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.username}</p>

      <button onClick={logout}>Logout</button>

      {error && <p>{error}</p>}

      {!error && projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project._id}>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
          <Link to={`/projects/${project._id}`}>View Project</Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;