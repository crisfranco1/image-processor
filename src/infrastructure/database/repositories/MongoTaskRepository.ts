import { Schema, model, Document, Types } from 'mongoose';
import { Task } from '../../../domain/entities/Task';
import { ITaskRepository } from '../../../application/ports/ITaskRepository';

interface TaskDoc extends Document {
    status: 'pending' | 'completed' | 'failed';
    price: number;
    createdAt: Date;
    updatedAt: Date;
    originalPath: string;
    images: {
        resolution: string;
        path: string;
    }[];
}

const TaskSchema = new Schema<TaskDoc>({
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed'] },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    originalPath: { type: String, required: true },
    images: [{
        resolution: { type: String, required: true },
        path: { type: String, required: true },
        _id: false
    }],
}, {
    versionKey: false,
});

const TaskModel = model<TaskDoc>('Task', TaskSchema, 'tasks');


export class MongoTaskRepository implements ITaskRepository {

    async createTask(taskData: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        const newTaskDoc = new TaskModel({
            ...taskData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedTaskDoc = await newTaskDoc.save();
        return this.mapDocumentToCreatedTask(savedTaskDoc);
    }

    async getTaskById(id: string): Promise<Task | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        const taskDoc = await TaskModel.findById(id);
        return taskDoc ? this.mapDocumentToTask(taskDoc) : null;
    }

    async updateTask(task: Task): Promise<Task> {
        if (!task.taskId) {
            throw new Error('Task must have an ID to be updated.');
        }
        if (!Types.ObjectId.isValid(task.taskId)) {
            throw new Error(`Invalid task ID: ${task.taskId}`);
        }
        const updatedDoc = await TaskModel.findByIdAndUpdate(
            task.taskId,
            {
                $set: {
                    status: task.status,
                    updatedAt: new Date(),
                    images: task.images
                }
            },
            { new: true, runValidators: true }
        );
        if (!updatedDoc) {
            throw new Error(`Task with ID ${task.taskId} not found for update.`);
        }
        return this.mapDocumentToTask(updatedDoc);
    }

    private mapDocumentToCreatedTask(doc: TaskDoc): Task {
        return {
            taskId: (doc._id as any).toString(),
            status: doc.status,
            price: doc.price
        };
    }

    private mapDocumentToTask(doc: TaskDoc): Task {
        return {
            taskId: (doc._id as any).toString(),
            status: doc.status,
            price: doc.price,
            images: doc.images.map(img => ({
                resolution: img.resolution,
                path: img.path
            }))
        };
    }

}