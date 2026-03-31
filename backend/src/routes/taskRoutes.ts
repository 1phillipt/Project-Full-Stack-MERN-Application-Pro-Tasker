import express, { Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";
import authMiddleware, { AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);

// POST /api/projects/:projectId/tasks
router.post("/projects/:projectId/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const { projectId } = req.params;

    if (!title) {
      res.status(400).json({ message: "Task title is required" });
      return;
    }

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    const task = await Task.create({
      title,
      description,
      status,
      project: project._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error creating task" });
  }
});

// GET /api/projects/:projectId/tasks
router.get("/projects/:projectId/tasks", async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    const tasks = await Task.find({ project: projectId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching tasks" });
  }
});

// PUT /api/tasks/:taskId
router.put("/tasks/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const project = await Project.findById(task.project);

    if (!project) {
      res.status(404).json({ message: "Parent project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error updating task" });
  }
});

// DELETE /api/tasks/:taskId
router.delete("/tasks/:taskId", async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const project = await Project.findById(task.project);

    if (!project) {
      res.status(404).json({ message: "Parent project not found" });
      return;
    }

    if (project.user.toString() !== req.user?._id) {
      res.status(403).json({ message: "Forbidden: not your project" });
      return;
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting task" });
  }
});

export default router;