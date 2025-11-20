/**
 * OpenAPI 3.0 Configuration
 *
 * Comprehensive API documentation using swagger-jsdoc.
 * All request/response schemas are auto-generated from Zod validators (DRY principle).
 */

import swaggerJsdoc from 'swagger-jsdoc';
import {
  signupRequestSchema,
  loginRequestSchema,
  authResponseSchema,
  createPropertyRequestSchema,
  propertyResponseSchema,
  propertyListResponseSchema,
  updatePropertyRequestSchema,
  createLeaseRequestSchema,
  updateLeaseRequestSchema,
  leaseWithDetailsResponseSchema,
  leaseListResponseSchema,
  errorResponseSchema,
  validationErrorResponseSchema,
} from './schemas';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Upkeep.io Property Management API',
      version: '1.0.0',
      description: `
Property management system for tracking maintenance activities, expenses, and vendors
across a portfolio of rental properties. Built with Clean Architecture principles.

## Authentication

All endpoints except \`/auth/signup\` and \`/auth/login\` require JWT authentication.
Include the JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Features

- Property management (CRUD operations)
- Lease management with lessees and occupants
- Maintenance work tracking (coming soon)
- Vendor management (coming soon)
- Receipt and expense tracking (coming soon)
- Mileage tracking for tax deductions (coming soon)

## Error Handling

The API uses standard HTTP status codes:
- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request (validation error)
- \`401\` - Unauthorized (missing or invalid token)
- \`403\` - Forbidden (insufficient permissions)
- \`404\` - Not Found
- \`422\` - Unprocessable Entity (validation error)
- \`500\` - Internal Server Error
      `.trim(),
      contact: {
        name: 'Upkeep.io Support',
        url: 'https://github.com/upkeep-io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.upkeep.io',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token obtained from /auth/login or /auth/signup',
        },
      },
      schemas: {
        // Auth schemas
        SignupRequest: signupRequestSchema,
        LoginRequest: loginRequestSchema,
        AuthResponse: authResponseSchema,

        // Property schemas
        CreatePropertyRequest: createPropertyRequestSchema,
        UpdatePropertyRequest: updatePropertyRequestSchema,
        PropertyResponse: propertyResponseSchema,
        PropertyListResponse: propertyListResponseSchema,

        // Lease schemas
        CreateLeaseRequest: createLeaseRequestSchema,
        UpdateLeaseRequest: updateLeaseRequestSchema,
        LeaseResponse: leaseWithDetailsResponseSchema,
        LeaseListResponse: leaseListResponseSchema,

        // Error schemas
        ErrorResponse: errorResponseSchema,
        ValidationErrorResponse: validationErrorResponseSchema,
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Unauthorized',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Forbidden',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Resource not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
              example: {
                error: 'Validation failed',
                details: [
                  {
                    path: ['email'],
                    message: 'Invalid email address',
                  },
                ],
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Internal server error',
              },
            },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check endpoint',
          description: 'Check if the API is running',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        example: 'ok',
                      },
                      timestamp: {
                        type: 'string',
                        format: 'date-time',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/signup': {
        post: {
          tags: ['Authentication'],
          summary: 'Create a new user account',
          description: 'Register a new user and receive a JWT authentication token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SignupRequest',
                },
                example: {
                  email: 'user@example.com',
                  password: 'SecurePassword123!',
                  name: 'John Doe',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '422': {
              description: 'Email already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  example: {
                    error: 'Email already exists',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with existing credentials',
          description: 'Authenticate user and receive a JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
                example: {
                  email: 'user@example.com',
                  password: 'SecurePassword123!',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  example: {
                    error: 'Invalid credentials',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/properties': {
        get: {
          tags: ['Properties'],
          summary: 'List all properties',
          description: 'Get all properties owned by the authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Properties retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PropertyListResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        post: {
          tags: ['Properties'],
          summary: 'Create a new property',
          description: 'Add a new property to the user\'s portfolio',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreatePropertyRequest',
                },
                example: {
                  street: '123 Main St',
                  address2: 'Apt 4B',
                  city: 'San Francisco',
                  state: 'CA',
                  zipCode: '94102',
                  nickname: 'Downtown Condo',
                  purchaseDate: '2023-01-15',
                  purchasePrice: 450000,
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Property created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PropertyResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/properties/{id}': {
        get: {
          tags: ['Properties'],
          summary: 'Get property by ID',
          description: 'Retrieve a specific property owned by the authenticated user',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Property ID',
            },
          ],
          responses: {
            '200': {
              description: 'Property retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PropertyResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        put: {
          tags: ['Properties'],
          summary: 'Update property',
          description: 'Update an existing property. All fields are optional.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Property ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdatePropertyRequest',
                },
                example: {
                  nickname: 'Updated Condo Name',
                  purchasePrice: 475000,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Property updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PropertyResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        delete: {
          tags: ['Properties'],
          summary: 'Delete property',
          description: 'Delete a property and all associated leases and maintenance records',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Property ID',
            },
          ],
          responses: {
            '204': {
              description: 'Property deleted successfully',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases': {
        get: {
          tags: ['Leases'],
          summary: 'List all leases',
          description: 'Get all leases for properties owned by the authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Leases retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseListResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        post: {
          tags: ['Leases'],
          summary: 'Create a new lease',
          description: 'Create a new lease with lessees and optional occupants',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateLeaseRequest',
                },
                example: {
                  propertyId: '123e4567-e89b-12d3-a456-426614174000',
                  startDate: '2024-01-01',
                  endDate: '2024-12-31',
                  monthlyRent: 2500,
                  securityDeposit: 5000,
                  depositPaidDate: '2023-12-15',
                  notes: 'First lease for this property',
                  lessees: [
                    {
                      firstName: 'Jane',
                      lastName: 'Smith',
                      email: 'jane@example.com',
                      phone: '555-0123',
                      signedDate: '2023-12-20',
                    },
                  ],
                  occupants: [
                    {
                      firstName: 'John',
                      lastName: 'Smith Jr',
                      isAdult: false,
                      moveInDate: '2024-01-01',
                    },
                  ],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Lease created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/{id}': {
        get: {
          tags: ['Leases'],
          summary: 'Get lease by ID',
          description: 'Retrieve a specific lease with all lessees and occupants',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
          ],
          responses: {
            '200': {
              description: 'Lease retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        put: {
          tags: ['Leases'],
          summary: 'Update lease',
          description: 'Update lease details. Does not update lessees or occupants (use dedicated endpoints).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateLeaseRequest',
                },
                example: {
                  monthlyRent: 2700,
                  status: 'MONTH_TO_MONTH',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Lease updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
        delete: {
          tags: ['Leases'],
          summary: 'Delete lease',
          description: 'Soft delete a lease (sets deletedAt timestamp)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
          ],
          responses: {
            '204': {
              description: 'Lease deleted successfully',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/property/{propertyId}': {
        get: {
          tags: ['Leases'],
          summary: 'List leases by property',
          description: 'Get all leases for a specific property',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'propertyId',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Property ID',
            },
          ],
          responses: {
            '200': {
              description: 'Leases retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseListResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              description: 'Property not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/{id}/lessees': {
        post: {
          tags: ['Leases'],
          summary: 'Add lessee to lease',
          description: 'Add a new lessee to an existing lease',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    personId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'ID of existing person to add as lessee',
                    },
                    signedDate: {
                      type: 'string',
                      format: 'date',
                      description: 'Date the lease was signed (optional)',
                    },
                  },
                  required: ['personId'],
                },
                example: {
                  personId: '123e4567-e89b-12d3-a456-426614174001',
                  signedDate: '2024-01-15',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Lessee added successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/{id}/lessees/{personId}': {
        delete: {
          tags: ['Leases'],
          summary: 'Remove lessee from lease',
          description: 'Remove a lessee from a lease',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
            {
              in: 'path',
              name: 'personId',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Person ID to remove',
            },
          ],
          responses: {
            '200': {
              description: 'Lessee removed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/{id}/occupants': {
        post: {
          tags: ['Leases'],
          summary: 'Add occupant to lease',
          description: 'Add a new occupant to an existing lease',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    personId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'ID of existing person to add as occupant',
                    },
                    isAdult: {
                      type: 'boolean',
                      description: 'Whether the occupant is an adult',
                    },
                    moveInDate: {
                      type: 'string',
                      format: 'date',
                      description: 'Move-in date (optional)',
                    },
                  },
                  required: ['personId', 'isAdult'],
                },
                example: {
                  personId: '123e4567-e89b-12d3-a456-426614174002',
                  isAdult: false,
                  moveInDate: '2024-01-01',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Occupant added successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '400': {
              $ref: '#/components/responses/ValidationError',
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
      '/api/leases/{id}/occupants/{occupantId}': {
        delete: {
          tags: ['Leases'],
          summary: 'Remove occupant from lease',
          description: 'Remove an occupant from a lease',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Lease ID',
            },
            {
              in: 'path',
              name: 'occupantId',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
              description: 'Occupant ID to remove',
            },
          ],
          responses: {
            '200': {
              description: 'Occupant removed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LeaseResponse',
                  },
                },
              },
            },
            '401': {
              $ref: '#/components/responses/UnauthorizedError',
            },
            '403': {
              $ref: '#/components/responses/ForbiddenError',
            },
            '404': {
              $ref: '#/components/responses/NotFoundError',
            },
            '500': {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Properties',
        description: 'Property management operations',
      },
      {
        name: 'Leases',
        description: 'Lease management with lessees and occupants',
      },
    ],
  },
  apis: [], // We define everything inline above
};

export const swaggerSpec = swaggerJsdoc(options);
