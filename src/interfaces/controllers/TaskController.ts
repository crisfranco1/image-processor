import { Request, Response } from 'express';
import { GetTaskByIdUseCase } from '../../application/use-cases/GetTaskByIdUseCase';
import { CreateTaskUseCase, CreateTaskCommand } from '../../application/use-cases/CreateTaskUseCase'; // NEW import

/**
 * @swagger
 * tags:
 * name: Tasks
 * description: API for managing tasks
 */
export class TaskController {
  private createTaskUseCase: CreateTaskUseCase;
  private getTaskByIdUseCase: GetTaskByIdUseCase;

  constructor(createTaskUseCase: CreateTaskUseCase, getTaskByIdUseCase: GetTaskByIdUseCase) {
    this.createTaskUseCase = createTaskUseCase;
    this.getTaskByIdUseCase = getTaskByIdUseCase;
    // Bind 'this' context for methods used as Express middleware
    this.createTask = this.createTask.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
  }




  /**
   * @swagger
    * /tasks:
    *   post:
    *     summary: Create a new task
    *     tags: [Tasks]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               originalPath:
    *                 type: string
    *                 description: The original path of the image to be processed
    *     responses:
    *       201:
    *         description: Task created successfully
    *         content:
    *           application/json:
    *             $ref: '#/components/schemas/Task'
    *       400:
    *         description: Bad request, missing required fields
   */

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { originalPath } = req.body;
      const command: CreateTaskCommand = {
        originalPath
      };
      const newTask = await this.createTaskUseCase.execute(command);
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error('Error creating task:', error);
      if (error.message.includes('Missing required fields')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    }
  }

  /**
   * @swagger
   * /tasks/{taskId}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         description: The ID of the task to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Task found
   *         content:
   *           application/json:
   *             $ref: '#/components/schemas/Task'
   *       404:
   *         description: Task not found
   */
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const task = await this.getTaskByIdUseCase.execute(taskId);

      if (!task) {
        res.status(404).json({ message: `Task with ID ${taskId} not found.` });
        return;
      }

      res.status(200).json(task);
    } catch (error: any) {
      console.error(`Error fetching task with ID ${req.params.id}:`, error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}