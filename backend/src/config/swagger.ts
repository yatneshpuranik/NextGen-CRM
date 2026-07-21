import swaggerJSDoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const serverUrl = isProduction
  ? process.env.API_BASE_URL ||
  'https://nextgen-crm-backend.onrender.com/crm/v1'
  : 'http://localhost:5000/crm/v1';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NextGen ERP + CRM Core APIs',
      version: '1.0.0',
      description:
        'API documentation for NextGen customer relationships, stock management, inventory, warehousing, invoicing, analytics, and reporting.',
    },

    servers: [
      {
        url: serverUrl,
        description: isProduction
          ? 'Production Server'
          : 'Local Development Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter the JWT access token received after successful login.',
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
    './dist/modules/**/*.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);