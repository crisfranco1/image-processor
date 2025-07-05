import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../ports/ITaskRepository';

export type CreateTaskCommand = Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>;

export class CreateTaskUseCase {
    private taskRepository: ITaskRepository;

    constructor(taskRepository: ITaskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(command: CreateTaskCommand): Promise<Task> {
        if (!command.originalPath) {
            throw new Error('Missing required fields for task creation (originalPath).');
        }
        const taskToCreate: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'> = {
            ...command,
            status: 'pending',
            price: this.generateRandomPrice()
        };
        const newTask = await this.taskRepository.createTask(taskToCreate);
        return newTask;
    }

    private generateRandomPrice(): number {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }

}

