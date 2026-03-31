import express, { Response } from "express";
import Project from "../models/Project";
import authMiddleware, { AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

// POST /api/projects
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }

    const project = await Project.create({
      name,
      description,
      user: req.user?._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error creating project" });
  }
});

// GET /api/projects
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ user: req.user?._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching projects" });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching project" });
  }
});

// PUT /api/projects/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    project.name = name || project.name;
    project.description = description ?? project.description;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error updating project" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting project" });
  }
});

export default router;