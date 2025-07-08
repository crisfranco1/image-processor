import mongoose from 'mongoose';
import { CreateTaskCommand, CreateTaskUseCase } from '../../src/application/use-cases/CreateTaskUseCase';
import { MongoTaskRepository, TaskModel } from '../../src/infrastructure/database/repositories/MongoTaskRepository';

describe('CreateTaskUseCase (Integration Test)', () => {
    let taskRepository: MongoTaskRepository;
    let createTaskUseCase: CreateTaskUseCase;
    let imageProcessor: any;

    beforeEach(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI!);
        }
        await TaskModel.deleteMany({});
        imageProcessor = { processImage: jest.fn().mockResolvedValue([]) };
        taskRepository = new MongoTaskRepository();
        createTaskUseCase = new CreateTaskUseCase(taskRepository, imageProcessor);
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await TaskModel.deleteMany({});
        jest.restoreAllMocks();
        await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should create a new task in the database', async () => {
        const command: CreateTaskCommand = {
            originalPath: 'input/test-image-2.jpg'
        };
        const createdTask = await createTaskUseCase.execute(command);
        expect(createdTask).toBeDefined();
        expect(createdTask.taskId).toBeDefined();
        expect(createdTask.status).toBe('pending');
        expect(createdTask.price).toBeGreaterThanOrEqual(5);
        expect(createdTask.price).toBeLessThanOrEqual(50);
        const dbTask = await TaskModel.findById(createdTask.taskId);
        expect(dbTask).not.toBeNull();
        expect(dbTask!.originalPath).toBe(command.originalPath);
    });

    it('should throw an error if originalPath is missing', async () => {
        const command: any = { images: [], status: 'pending', price: 10 };
        await expect(createTaskUseCase.execute(command)).rejects.toThrow('Missing required fields for task creation (originalPath).');
    });

});
