import { Task } from '../../domain/entities/Task';

export interface ITaskRepository {
  createTask(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  getTaskById(id: string): Promise<Task | null>;
}