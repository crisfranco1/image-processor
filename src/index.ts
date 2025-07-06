import 'dotenv/config';
import express from 'express';
import { connectDB } from './infrastructure/database/mongo-connection';
import { MongoTaskRepository } from './infrastructure/database/repositories/MongoTaskRepository';
import { CreateTaskUseCase } from './application/use-cases/CreateTaskUseCase';
import { GetTaskByIdUseCase } from './application/use-cases/GetTaskByIdUseCase';
import { TaskController } from './interfaces/controllers/TaskController';
import { ImageProcessor } from './infrastructure/services/ImageProcessor';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger'; 

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/image_processor_db';

// Configuration for Image Processing
const IMAGE_OUTPUT_DIR = path.join(__dirname, '..', 'output');
if (!fs.existsSync(IMAGE_OUTPUT_DIR)) {
  fs.mkdirSync(IMAGE_OUTPUT_DIR, { recursive: true });
  console.log(`Created image output directory: ${IMAGE_OUTPUT_DIR}`);
}

// Connect to MongoDB
connectDB(MONGO_URI);

// Dependencies injection: wiring up our hexagonal architecture
const taskRepository = new MongoTaskRepository();
const imageProcessor = new ImageProcessor(IMAGE_OUTPUT_DIR);
// Use Cases
const createTaskUseCase = new CreateTaskUseCase(taskRepository, imageProcessor);
const getTaskByIdUseCase = new GetTaskByIdUseCase(taskRepository);

// Controllers
const taskController = new TaskController(createTaskUseCase, getTaskByIdUseCase);

// Middleware
app.use(express.json());

// Routes
app.post('/tasks', taskController.createTask);
app.get('/tasks/:taskId', taskController.getTaskById);

// Serve the Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});