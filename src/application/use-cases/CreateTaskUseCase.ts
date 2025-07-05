import { Task, Image } from '../../domain/entities/Task';
import { ITaskRepository } from '../ports/ITaskRepository';

export type CreateTaskCommand = Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>;

export class CreateTaskUseCase {
    private taskRepository: ITaskRepository;
    private imageProcessor: any;
    private processQueue: (() => Promise<void>)[];
    private isProcessingQueueRunning: boolean;

    constructor(taskRepository: ITaskRepository, imageProcessor: any) {
        this.taskRepository = taskRepository;
        this.imageProcessor = imageProcessor;
        this.processQueue = [];
        this.isProcessingQueueRunning = false;
        this.startProcessingQueue();
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
        if (newTask.status === 'pending') {
            this.addTaskToProcessingQueue(newTask.taskId!, command.originalPath);
        }
        return newTask;
    }

    private generateRandomPrice(): number {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    }

    private async startProcessingQueue(): Promise<void> {
        if (this.isProcessingQueueRunning) {
            return;
        }
        this.isProcessingQueueRunning = true;
        console.log('Image processing queue started...');
        while (true) {
            if (this.processQueue.length > 0) {
                const processFunction = this.processQueue.shift();
                if (processFunction) {
                    try {
                        await processFunction();
                    } catch (error) {
                        console.error('Unhandled error in processing queue task:', error);
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    private addTaskToProcessingQueue(taskId: string, originalPath: string): void {
        this.processQueue.push(async () => {
            console.log(`Starting image processing for task ID: ${taskId}`);
            let taskToUpdate: Task | null = null;
            try {
                taskToUpdate = await this.taskRepository.getTaskById(taskId);
                if (!taskToUpdate) {
                    console.error(`Task ${taskId} not found in DB during processing attempt.`);
                    return;
                }
                if (taskToUpdate.status !== 'pending') {
                    console.warn(`Task ${taskId} status is not 'pending'. Skipping image generation.`);
                    return;
                }
                const resolutions = [1024, 800];
                const generatedImages: Image[] = await this.imageProcessor.processImage(originalPath, taskId, resolutions);
                taskToUpdate.status = 'completed';
                taskToUpdate.images = generatedImages;
                taskToUpdate.updatedAt = new Date();
                console.log(`Image processing completed for task ID: ${taskId}`);
            } catch (error: any) {
                console.error(`Image processing failed for task ID: ${taskId}:`, error);
                if (taskToUpdate) {
                    taskToUpdate.status = 'failed';
                    taskToUpdate.updatedAt = new Date();
                } else {
                    console.error(`Attempted to update status for non-existent task ${taskId} after processing error.`);
                    return;
                }
            } finally {
                if (taskToUpdate) {
                    await this.taskRepository.updateTask(taskToUpdate);
                }
            }
        });
    }

}

