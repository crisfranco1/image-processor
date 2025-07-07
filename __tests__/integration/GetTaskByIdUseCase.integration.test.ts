import mongoose from 'mongoose';
import { GetTaskByIdUseCase } from '../../src/application/use-cases/GetTaskByIdUseCase';
import { MongoTaskRepository, TaskModel } from '../../src/infrastructure/database/repositories/MongoTaskRepository';
import { Task } from '../../src/domain/entities/Task';

describe('GetTaskByIdUseCase (Integration Test)', () => {
  let taskRepository: MongoTaskRepository;
  let getTaskByIdUseCase: GetTaskByIdUseCase;

  beforeEach(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }
    await TaskModel.deleteMany({});

    taskRepository = new MongoTaskRepository();
    getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);

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

  it('should return the task if found in the database', async () => {
    const mockTaskData: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt' | 'images'> = {
      status: 'completed',
      price: 150.75,
      originalPath: 'input/test-image-1.jpg',
    };
    const savedTaskDoc = await TaskModel.create({
      ...mockTaskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
    });

    const taskId = (savedTaskDoc._id as any).toString();
    const result = await getTaskByIdUseCase.execute(taskId);

    expect(result).toBeDefined();
    expect(result!.taskId).toBe(taskId);
    expect(result!.status).toBe(mockTaskData.status);
    expect(result!.price).toBe(mockTaskData.price);
    expect(result!.images).toEqual([]);
  });

  it('should return null if the task is not found in the database', async () => {
    const nonExistentTaskId = new mongoose.Types.ObjectId().toHexString();
    const result = await getTaskByIdUseCase.execute(nonExistentTaskId);
    expect(result).toBeNull();
  });

  it('should return null if the provided ID is in an invalid format', async () => {
    const invalidTaskId = 'not-a-valid-mongo-id';
    const result = await getTaskByIdUseCase.execute(invalidTaskId);
    expect(result).toBeNull();
  });
});