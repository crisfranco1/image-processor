import { Request, Response } from 'express';
import { GetTaskByIdUseCase } from '../../application/use-cases/GetTaskByIdUseCase';

export class TaskController {
  private getTaskByIdUseCase: GetTaskByIdUseCase;

  constructor(getTaskByIdUseCase: GetTaskByIdUseCase) {
    this.getTaskByIdUseCase = getTaskByIdUseCase;
    // Bind 'this' context for methods used as Express middleware
    this.getTaskById = this.getTaskById.bind(this);
  }

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