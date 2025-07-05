import 'dotenv/config'; // Load environment variables from .env file
import express from 'express';
import { connectDB } from './infrastructure/database/mongo-connection';
import { MongoTaskRepository } from './infrastructure/database/repositories/MongoTaskRepository';
import { CreateTaskUseCase } from './application/use-cases/CreateTaskUseCase';
import { GetTaskByIdUseCase } from './application/use-cases/GetTaskByIdUseCase';
import { TaskController } from './interfaces/controllers/TaskController';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/image_processor_db';

// Connect to MongoDB
connectDB(MONGO_URI);

// Dependencies injection: wiring up our hexagonal architecture
const taskRepository = new MongoTaskRepository();
// Use Cases
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);

// Controllers
const taskController = new TaskController(createTaskUseCase, getTaskByIdUseCase);

// Middleware
app.use(express.json());

// Routes
app.post('/tasks', taskController.createTask);
app.get('/tasks/:taskId', taskController.getTaskById);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});