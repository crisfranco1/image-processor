import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Image Processor API Documentation',
            version: '1.0.0',
            description: 'A comprehensive API documentation for the Image Processor API, built with Express.js and TypeScript.',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                Task: {
                    type: 'object',
                    properties: {
                        taskId: { type: 'string', description: 'Unique identifier for the task' },
                        status: { type: 'string', enum: ['pending', 'completed', 'failed'], description: 'Current status of the task' },
                        price: { type: 'number', format: 'float', description: 'Price associated with the task' },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    resolution: { type: 'string', description: 'Resolution of the generated image (e.g., "1024px")' },
                                    path: { type: 'string', description: 'Path to the generated image file' },
                                }
                            },
                            description: 'Array of generated image outputs'
                        },
                    },
                    required: ['status', 'price', 'originalPath', 'images']
                },
                CreateTaskRequest: {
                    type: 'object',
                    properties: {
                        originalPath: { type: 'string', description: 'Path to the original input image for processing (e.g., "input/my_image.jpg")', example: 'input/sample.jpg' },
                    },
                    required: ['originalPath']
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', description: 'A user-friendly error message.' }
                    }
                }
            },
        },
    },
    apis: [
        './src/interfaces/controllers/*.ts'
    ],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;