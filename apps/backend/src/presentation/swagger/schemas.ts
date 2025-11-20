/**
 * Swagger Schema Generator
 *
 * Converts Zod validators to OpenAPI/JSON schemas using zod-to-json-schema.
 * This ensures DRY principles - single source of truth for validation rules.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  signupSchema,
  loginSchema,
  createPropertySchema,
  createLeaseSchema,
  updateLeaseSchema,
} from '@upkeep-io/validators';

/**
 * Convert Zod schema to OpenAPI 3.0 JSON Schema
 * Removes the $schema property that zod-to-json-schema adds
 */
function toOpenApiSchema(zodSchema: any) {
  const jsonSchema = zodToJsonSchema(zodSchema, { $refStrategy: 'none' });
  // Remove $schema property for OpenAPI compatibility
  const { $schema, ...rest } = jsonSchema as any;
  return rest;
}

// Auth Schemas
export const signupRequestSchema = toOpenApiSchema(signupSchema);
export const loginRequestSchema = toOpenApiSchema(loginSchema);

export const authResponseSchema = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      description: 'JWT authentication token',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    user: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'User ID',
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address',
        },
        name: {
          type: 'string',
          description: 'User full name',
        },
      },
      required: ['id', 'email', 'name'],
    },
  },
  required: ['token', 'user'],
};

// Property Schemas
export const createPropertyRequestSchema = toOpenApiSchema(createPropertySchema);

export const propertyResponseSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Property ID',
    },
    userId: {
      type: 'string',
      format: 'uuid',
      description: 'Owner user ID',
    },
    street: {
      type: 'string',
      description: 'Street address',
      example: '123 Main St',
    },
    address2: {
      type: 'string',
      description: 'Address line 2 (optional)',
      example: 'Apt 4B',
    },
    city: {
      type: 'string',
      description: 'City',
      example: 'San Francisco',
    },
    state: {
      type: 'string',
      description: 'State code (2 characters)',
      example: 'CA',
    },
    zipCode: {
      type: 'string',
      description: 'ZIP code',
      example: '94102',
    },
    nickname: {
      type: 'string',
      description: 'Property nickname (optional)',
      example: 'Downtown Condo',
    },
    purchaseDate: {
      type: 'string',
      format: 'date-time',
      description: 'Purchase date (optional)',
    },
    purchasePrice: {
      type: 'number',
      description: 'Purchase price (optional)',
      example: 450000,
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
    },
  },
  required: ['id', 'userId', 'street', 'city', 'state', 'zipCode', 'createdAt', 'updatedAt'],
};

export const propertyListResponseSchema = {
  type: 'array',
  items: propertyResponseSchema,
};

export const updatePropertyRequestSchema = {
  type: 'object',
  properties: {
    street: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
    address2: {
      type: 'string',
      maxLength: 100,
    },
    city: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    state: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
    },
    zipCode: {
      type: 'string',
      pattern: '^\\d{5}(-\\d{4})?$',
    },
    nickname: {
      type: 'string',
      maxLength: 100,
    },
    purchaseDate: {
      type: 'string',
      format: 'date',
    },
    purchasePrice: {
      type: 'number',
      minimum: 0,
    },
  },
  description: 'All fields are optional. Only provided fields will be updated.',
};

// Lease Schemas
export const createLeaseRequestSchema = toOpenApiSchema(createLeaseSchema);
export const updateLeaseRequestSchema = toOpenApiSchema(updateLeaseSchema);

export const leaseResponseSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Lease ID',
    },
    userId: {
      type: 'string',
      format: 'uuid',
      description: 'Owner user ID',
    },
    propertyId: {
      type: 'string',
      format: 'uuid',
      description: 'Property ID',
    },
    startDate: {
      type: 'string',
      format: 'date-time',
      description: 'Lease start date',
    },
    endDate: {
      type: 'string',
      format: 'date-time',
      description: 'Lease end date (optional)',
    },
    monthlyRent: {
      type: 'number',
      description: 'Monthly rent amount (optional)',
      example: 2500,
    },
    securityDeposit: {
      type: 'number',
      description: 'Security deposit amount (optional)',
      example: 5000,
    },
    depositPaidDate: {
      type: 'string',
      format: 'date-time',
      description: 'Date deposit was paid (optional)',
    },
    notes: {
      type: 'string',
      description: 'Additional notes (optional)',
    },
    status: {
      type: 'string',
      enum: ['ACTIVE', 'MONTH_TO_MONTH', 'ENDED', 'VOIDED'],
      description: 'Lease status',
    },
    voidedReason: {
      type: 'string',
      description: 'Reason for voiding (optional)',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Creation timestamp',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Last update timestamp',
    },
  },
  required: ['id', 'userId', 'propertyId', 'startDate', 'status', 'createdAt', 'updatedAt'],
};

export const leaseWithDetailsResponseSchema = {
  allOf: [
    leaseResponseSchema,
    {
      type: 'object',
      properties: {
        lessees: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              personId: {
                type: 'string',
                format: 'uuid',
              },
              signedDate: {
                type: 'string',
                format: 'date-time',
              },
              person: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  middleName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                },
                required: ['id', 'firstName', 'lastName', 'email', 'phone'],
              },
            },
            required: ['id', 'personId', 'person'],
          },
        },
        occupants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
              },
              personId: {
                type: 'string',
                format: 'uuid',
              },
              isAdult: {
                type: 'boolean',
              },
              moveInDate: {
                type: 'string',
                format: 'date-time',
              },
              moveOutDate: {
                type: 'string',
                format: 'date-time',
              },
              person: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  middleName: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                },
                required: ['id', 'firstName', 'lastName'],
              },
            },
            required: ['id', 'personId', 'isAdult', 'person'],
          },
        },
      },
    },
  ],
};

export const leaseListResponseSchema = {
  type: 'array',
  items: leaseWithDetailsResponseSchema,
};

// Error Schemas
export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'string',
      description: 'Error message',
      example: 'Resource not found',
    },
  },
  required: ['error'],
};

export const validationErrorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'string',
      description: 'Validation error message',
      example: 'Validation failed',
    },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: {
            type: 'array',
            items: { type: 'string' },
            description: 'Field path that failed validation',
          },
          message: {
            type: 'string',
            description: 'Validation error message',
          },
        },
      },
      description: 'Detailed validation errors',
    },
  },
  required: ['error'],
};
