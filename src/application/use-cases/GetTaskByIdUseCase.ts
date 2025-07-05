import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../ports/ITaskRepository';

export class GetTaskByIdUseCase {
    private taskRepository: ITaskRepository;

    constructor(taskRepository: ITaskRepository) {
        this.taskRepository = taskRepository;
    }

    async execute(id: string): Promise<Task | null> {
        return this.taskRepository.getTaskById(id);
    }
}
