import { GetTaskByIdUseCase } from '../../src/application/use-cases/GetTaskByIdUseCase';
import { ITaskRepository } from '../../src/application/ports/ITaskRepository';
import { Task } from '../../src/domain/entities/Task';

describe('GetTaskByIdUseCase', () => {
    let mockTaskRepository: jest.Mocked<ITaskRepository>;
    let getTaskByIdUseCase: GetTaskByIdUseCase;

    beforeEach(() => {
        mockTaskRepository = {
            getTaskById: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
        };
        getTaskByIdUseCase = new GetTaskByIdUseCase(mockTaskRepository);
    });

    it('should return the task if found', async () => {
        const taskId = 'test-id-123';
        const mockTask: Task = {
            taskId: taskId,
            status: 'pending',
            price: 10
        };
        mockTaskRepository.getTaskById.mockResolvedValue(mockTask);
        const result = await getTaskByIdUseCase.execute(taskId);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledTimes(1);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledWith(taskId);
        expect(result).toEqual(mockTask);
    });

    it('should return the task if it is completed', async () => {
        const taskId = 'completed-task-id';
        const mockTask: Task = {
            taskId: taskId,
            status: 'completed',
            price: 20,
            images: [
                { resolution: '1024px', path: '/output/image-1024.jpg' },
                { resolution: '800px', path: 'output/image-800.jpg' }
            ]
        };
        mockTaskRepository.getTaskById.mockResolvedValue(mockTask);
        const result = await getTaskByIdUseCase.execute(taskId);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledTimes(1);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledWith(taskId);
        expect(result).toEqual(mockTask);
        expect(result?.status).toBe('completed');
        expect(result?.images?.length).toBe(2);
    });

    it('should return null if the task is not found', async () => {
        const taskId = 'non-existent-id';
        mockTaskRepository.getTaskById.mockResolvedValue(null);
        const result = await getTaskByIdUseCase.execute(taskId);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledTimes(1);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledWith(taskId);
        expect(result).toBeNull();
    });

    it('should throw an error if the repository throws an error', async () => {
        const taskId = 'error-id';
        const error = new Error('Database read error');
        mockTaskRepository.getTaskById.mockRejectedValue(error);
        await expect(getTaskByIdUseCase.execute(taskId)).rejects.toThrow('Database read error');
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledTimes(1);
        expect(mockTaskRepository.getTaskById).toHaveBeenCalledWith(taskId);
    });
});