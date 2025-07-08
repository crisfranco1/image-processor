import { CreateTaskUseCase, CreateTaskCommand } from '../../src/application/use-cases/CreateTaskUseCase';
import { ITaskRepository } from '../../src/application/ports/ITaskRepository';
import { Task } from '../../src/domain/entities/Task';

describe('CreateTaskUseCase', () => {
    let mockTaskRepository: jest.Mocked<ITaskRepository>;
    let createTaskUseCase: CreateTaskUseCase;

    beforeEach(() => {
        mockTaskRepository = {
            createTask: jest.fn(),
            updateTask: jest.fn(),
            getTaskById: jest.fn(),
        } as any;
        const mockImageProcessor = { process: jest.fn() };
        createTaskUseCase = new CreateTaskUseCase(mockTaskRepository, mockImageProcessor);
    });

    it('should create a new task from a local and return it', async () => {
        const command: CreateTaskCommand = {
            originalPath: 'input/image.jpg'
        };
        const createdTask: Task = {
            taskId: 'abc123',
            status: 'pending',
            price: 10,
            originalPath: 'input/image.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
        };
        mockTaskRepository.createTask.mockResolvedValue(createdTask);
        const result = await createTaskUseCase.execute(command);
        expect(mockTaskRepository.createTask).toHaveBeenCalledWith(expect.objectContaining({
            originalPath: command.originalPath
        }));
        expect(result).toEqual(createdTask);
    });

    it('should create a new task from a URL originalPath and return it', async () => {
        const url = 'https://example.com/image.jpg';
        const command: CreateTaskCommand = {
            originalPath: url
        };
        const createdTask: Task = {
            taskId: 'url123',
            status: 'pending',
            price: 10,
            originalPath: url,
            createdAt: new Date(),
            updatedAt: new Date(),
            images: [],
        };
        mockTaskRepository.createTask.mockResolvedValue(createdTask);
        const result = await createTaskUseCase.execute(command);
        expect(mockTaskRepository.createTask).toHaveBeenCalledWith(expect.objectContaining({
            originalPath: command.originalPath
        }));
        expect(result).toEqual(createdTask);
    });

    it('should throw an error if originalPath is missing', async () => {
        await expect(createTaskUseCase.execute({})).rejects.toThrow('Missing required fields');
    });


});