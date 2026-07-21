import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NextGen ERP + CRM Core APIs',
      version: '1.0.0',
      description: 'API documentation for NextGen customer relationships, stock management, and invoicing services.',
    },
    servers: [
      {
        url: 'http://localhost:5000/crm/v1',
        description: 'Local Development Server',
      },
      {
        url: 'https://nextgen-api.onrender.com/crm/v1',
        description: 'Production Render PaaS',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your JWT access token below to authenticate API requests.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/modules/**/*.ts',
    './dist/routes/*.js',
    './dist/modules/**/*.js'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
