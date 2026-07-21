import swaggerJSDoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const serverUrl = isProduction
  ? process.env.API_BASE_URL || 'https://api.yatneshpuranik.online'
  : 'http://localhost:5000';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NextGen ERP + CRM Enterprise APIs',
      version: '1.0.0',
      description:
        'Enterprise API documentation for NextGen customer relationship management, multi-warehouse inventory, sales delivery challans, analytics, and audit compliance.',
      contact: {
        name: 'Yatnesh Puranik Engineering',
        url: 'https://yatneshpuranik.online',
        email: 'yatneshpuranik@gmail.com',
      },
    },

    servers: [
      {
        url: serverUrl,
        description: isProduction ? 'Production Server' : 'Local Development Server',
      },
      {
        url: 'https://api.yatneshpuranik.online',
        description: 'Production API Endpoint',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your Bearer JWT access token to authenticate enterprise endpoints.',
        },
      },

      schemas: {
        // 1. User Schema
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr_98a7b6c5' },
            email: { type: 'string', format: 'email', example: 'admin@yatneshpuranik.online' },
            fullName: { type: 'string', example: 'Yatnesh Puranik' },
            role: { type: 'string', enum: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], example: 'ADMIN' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 2. LoginRequest Schema
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@yatneshpuranik.online' },
            password: { type: 'string', format: 'password', example: 'AdminPass123!' },
          },
        },

        // 3. LoginResponse Schema
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication successful' },
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },

        // 4. RegisterRequest Schema
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'Yatnesh Puranik' },
            email: { type: 'string', format: 'email', example: 'sales@yatneshpuranik.online' },
            password: { type: 'string', format: 'password', example: 'SecurePass123!' },
            role: { type: 'string', enum: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], example: 'SALES' },
          },
        },

        // 5. RegisterResponse Schema
        RegisterResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User account created successfully' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },

        // 6. Customer Schema
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cust_88a91b' },
            customerCode: { type: 'string', example: 'CUST-1001' },
            companyName: { type: 'string', example: 'Acme Enterprises' },
            contactPerson: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'contact@acme.com' },
            phone: { type: 'string', example: '+91-9876543210' },
            address: { type: 'string', example: '123 Business Park, Mumbai' },
            gstNumber: { type: 'string', example: '27AAAAA0000A1Z5' },
            customerType: { type: 'string', enum: ['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], example: 'WHOLESALE' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 7. Product Schema
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prod_12345' },
            productCode: { type: 'string', example: 'PRD-2001' },
            productName: { type: 'string', example: 'Industrial Steel Valve' },
            sku: { type: 'string', example: 'VALVE-STL-50' },
            description: { type: 'string', example: 'High durability pressure valve' },
            category: { type: 'string', example: 'Hardware' },
            brand: { type: 'string', example: 'TATA' },
            unit: { type: 'string', example: 'Units' },
            costPrice: { type: 'number', example: 1200.00 },
            sellingPrice: { type: 'number', example: 1850.00 },
            currentStock: { type: 'number', example: 450 },
            minimumStock: { type: 'number', example: 50 },
            isActive: { type: 'boolean', example: true },
            imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1/valve.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 8. Warehouse Schema
        Warehouse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'wh_7718' },
            code: { type: 'string', example: 'WH-MUM-01' },
            name: { type: 'string', example: 'Mumbai Central Hub' },
            address: { type: 'string', example: 'Plot 45, MIDC Zone, Mumbai' },
            contactPerson: { type: 'string', example: 'Rajesh Sharma' },
            contactNumber: { type: 'string', example: '+91-9820012345' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
            totalStockCount: { type: 'number', example: 12850 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 9. Inventory Schema
        Inventory: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'inv_9912' },
            productId: { type: 'string', example: 'prod_12345' },
            warehouseId: { type: 'string', example: 'wh_7718' },
            availableStock: { type: 'number', example: 350 },
            allocatedStock: { type: 'number', example: 50 },
            minimumStock: { type: 'number', example: 30 },
            batchNumber: { type: 'string', example: 'BATCH-2026-07' },
            product: { $ref: '#/components/schemas/Product' },
            warehouse: { $ref: '#/components/schemas/Warehouse' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 10. SalesChallan Schema
        SalesChallan: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ch_4412' },
            challanNumber: { type: 'string', example: 'CH-2026-0089' },
            customerId: { type: 'string', example: 'cust_88a91b' },
            warehouseId: { type: 'string', example: 'wh_7718' },
            dispatchDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], example: 'CONFIRMED' },
            subtotal: { type: 'number', example: 145000.00 },
            taxAmount: { type: 'number', example: 26100.00 },
            totalAmount: { type: 'number', example: 171100.00 },
            remarks: { type: 'string', example: 'Dispatch via Freight Logistics' },
            customer: { $ref: '#/components/schemas/Customer' },
            warehouse: { $ref: '#/components/schemas/Warehouse' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // 11. DashboardSummary Schema
        DashboardSummary: {
          type: 'object',
          properties: {
            totalCustomers: { type: 'number', example: 1482 },
            totalProducts: { type: 'number', example: 320 },
            totalWarehouses: { type: 'number', example: 5 },
            monthlyRevenue: { type: 'number', example: 4580000.00 },
            lowStockProducts: { type: 'number', example: 12 },
            draftChallans: { type: 'number', example: 4 },
          },
        },

        // 12. Report Schema
        Report: {
          type: 'object',
          properties: {
            reportType: { type: 'string', example: 'sales' },
            generatedAt: { type: 'string', format: 'date-time' },
            summary: { type: 'object' },
            records: { type: 'array', items: { type: 'object' } },
          },
        },

        // 13. ErrorResponse Schema
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found or unauthorized access' },
            error: { type: 'string', example: 'NOT_FOUND' },
          },
        },

        // 14. ValidationError Schema
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Must be a valid email address' },
                },
              },
            },
          },
        },

        // 15. Pagination Schema
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 5 },
            totalRecords: { type: 'number', example: 98 },
          },
        },

        // 16. SuccessResponse Schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation executed successfully' },
          },
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