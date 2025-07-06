# Image Processor

A RESTful API for image processing using Node.js, Express, MongoDB (Mongoose), and Sharp.

## Table of Contents

* [Features](#features)
* [Architecture](#architecture)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [Running the Application](#running-the-application)
    * [Development Mode](#development-mode)
    * [Production Mode](#production-mode)
* [API Endpoints](#api-endpoints)
    * [Get Task by ID (GET /tasks/:taskId)](#get-task-by-id-get-taskstaskid)
    * [Create New Task (POST /tasks)](#create-new-task-post-tasks)
* [Image Processing](#image-processing)
* [Project Structure](#project-structure)

## Features

* **RESTful API:** Exposes endpoints for managing tasks.
* **TypeScript:** Provides strong typing for improved code quality and maintainability.
* **MongoDB:** NoSQL database for data persistence.
* **Asynchronous Image Processing:** Generates multiple image resolutions (`1024px`, `800px`) in the background using `sharp` when a task with an `originalPath` is created.
* **Task Status Tracking:** Updates task status (`pending`, `completed`, `failed`) based on image processing outcome.

## Architecture

This project is structured using a Hexagonal Architecture (also known as Ports and Adapters).

* **`src/domain`**: Contains core business entities (e.g., `Task`). This layer is framework and database agnostic.
* **`src/application`**: Defines the application's business logic (Use Cases) and abstract interfaces (Ports) that external services must implement. This layer orchestrates domain entities.
    * `ports`: Interfaces like `ITaskRepository` that define contracts for data persistence.
    * `use-cases`: Classes like `GetTaskByIdUseCase`, `CreateTaskUseCase` that encapsulate specific business operations.
* **`src/infrastructure`**: Contains concrete implementations (Adapters) of the ports defined in the application layer. This is where external concerns like database access and third-party services reside.
    * `database`: MongoDB connection and `MongoTaskRepository` (an adapter for `ITaskRepository`).
    * `services`: `ImageProcessor` (an adapter for image processing using `sharp`).
* **`src/interfaces`**: Contains external facing adapters, such as REST API controllers, that translate external requests into calls to the application layer and translate application responses back to the external format.
    * `controllers`: `TaskController` handles HTTP requests and responses.
* **`src/index.ts`**: The application's entry point, responsible for bootstrapping the Express app and wiring up dependencies (Dependency Injection).

## Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js**: v18.x or higher (LTS recommended)
* **npm**: Comes with Node.js
* **MongoDB**: A running MongoDB instance (local or remote). You can use Docker to quickly spin up a local instance:
    ```bash
    docker run -d -p 27017:27017 --name mongo-dev mongo:latest
    ```
* **Image Files:** For testing the image processing, you'll need some sample `.jpg` or `.png` images placed in an `input` directory at the project root.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/crisfranco1/image-processor.git
    cd image-processor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create necessary directories:**
    The application expects an `input` directory for original images and an `output` directory for generated images.
    ```bash
    mkdir input
    mkdir output
    ```
    *Place your sample image files (e.g., `test-image.jpg`) into the `input` directory.*

## Configuration

1.  **Create a `.env` file:**
    In the root of your project, create a file named `.env` and add your MongoDB connection string and desired port:

    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/image?processor_db
    ```
    *If your MongoDB is running on a different host or port, adjust `MONGO_URI` accordingly.*

## Running the Application

### Development Mode

For development, `nodemon` and `ts-node` are used to automatically recompile and restart the server on code changes.

```bash
npm run dev
```
Upon successful startup, you should see messages in your terminal similar to:

```env
MongoDB connected successfully!
Image output directory: /path/to/your/project/output
Image processing queue started...
Server is running on http://localhost:3000
```

### Production Mode

For deploying your application to a production environment, it's best practice to first compile your TypeScript code into plain JavaScript. This results in faster startup times and better performance.

1.  **Build the project:**
    ```bash
    npm run build
    ```
    This command will compile all `.ts` files from the `src` directory and output the compiled `.js` files into the `dist` directory.

2.  **Start the compiled application:**
    ```bash
    npm start
    ```
    This command executes the main JavaScript file from the `dist` directory.
    
    The API will be available at `http://localhost:3000` (or the port you set in `.env`).



## API Endpoints
The API will be accessible at `http://localhost:3000` (or the port you configured in your `.env` file). You can use tools like Postman or command-line utilities like `curl` to test these endpoints.

### Get Task by ID (GET /tasks/:taskId)

Retrieves a single task using its unique Task ID.

* **URL:** `http://localhost:3000/tasks/<task_id>`
    *(Replace `<task_id>` with an actual task ID from your MongoDB collection, e.g., `65d4a54b89c5e342b2c2c5f6`)*
* **Method:** `GET`
* **Response (200 OK):** A single task object matching the provided ID.
    ```json
    {
      "taskId": "65d4a54b89c5e342b2c2c5f6",
      "status": "completed",
      "price": 25.5,
      "images": [
        { "resolution": "1024", "path": "/output/image1/1024/f322b730b287da77e1c519c7ffef4fc2.jpg" },
        { "resolution": "800", "path": "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg" }
      ]
    }
    ```
* **Response (404 Not Found):** If the provided ID does not correspond to an existing task or is in an invalid format.
    ```json
    {
      "message": "Task with ID <task_id> not found."
    }
    ```

### Create New Task (POST /tasks)

Creates a new task in the database. If an `originalPath` is provided, this will also trigger an asynchronous image processing job.

* **URL:** `http://localhost:3000/tasks`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
    ```json
    {
      "originalPath": "input/my_image.jpg" # Required for image processing. Path should be relative to the project root.
    }
    ```
    *Ensure the image file specified in `originalPath` exists in your project's `input/` directory.*

* **Response (201 Created):**
    * **Immediately after creation (if image processing is triggered):**
        The API will respond quickly with the task's status set to `'pending'`, as the image generation happens in the background.
        ```json
        {
          "taskId": "...",
          "status": "pending",
          "price": 50
        }
        ```
    * **After image processing completes (you can check by fetching the task via `GET /tasks/:id`):**
        The task's status will be updated, and the `images` array will contain the paths to the newly generated image files.
        ```json
        {
          "taskId": "...",
          "status": "completed", # Status updated to 'completed'
          "price": 50,
          "images": [
            { "resolution": "1024", "path": "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg" },
            { "resolution": "800", "path": "/output/image1/800/202fd8b3174a774bac24428e8cb230a1.jpg" }
          ]
        }
        ```
    * **If image processing fails (check via `GET /tasks/:id`):**
        The task's status will be updated to `'failed'`.
        ```json
        {
          "taskId": "...",
          "status": "failed",
          "price": 50,
          "images": []
        }
        ```

## License

GNU GENERAL PUBLIC LICENSE

## Issues

For issues, please open a ticket
