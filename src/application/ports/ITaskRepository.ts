import { Task } from '../../domain/entities/Task';

export interface ITaskRepository {
  getTaskById(id: string): Promise<Task | null>;
}