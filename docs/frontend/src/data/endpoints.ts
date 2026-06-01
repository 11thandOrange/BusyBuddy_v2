/**
 * BusyBuddy_v2 API Endpoint Definitions
 * Maintained by api-spec-generator agent.
 * Run after modifying routes in web/backend/routes/.
 */
import { Endpoint } from '../types/api';

export const bundlesEndpoints: Endpoint[] = [
  {
    id: 'bundles-list', method: 'GET', path: '/api/bundles',
    title: 'List Bundles',
    description: 'Returns all bundle discount configurations for the authenticated shop.',
    parameters: [{ name: 'shop', type: 'string', required: true,
      description: 'Shopify shop domain (from session)', location: 'header' }],
    requestBody: null,
    responseExample: { success: true, data: [
      { _id: '64a1...', shop: 'store.myshopify.com', name: 'Buy 2 Get 1', isActive: true }
    ]},
  },
  {
    id: 'bundles-create', method: 'POST', path: '/api/bundles',
    title: 'Create Bundle', description: 'Creates a new bundle discount for the shop.',
    parameters: [],
    requestBody: { contentType: 'application/json',
      schema: { name: 'string', discountType: 'percentage|fixed', discountValue: 'number', minQuantity: 'number' },
      example: { name: 'Buy 2 Get 1', discountType: 'percentage', discountValue: 100, minQuantity: 3 }},
    responseExample: { success: true, data: { _id: '...', name: 'Buy 2 Get 1' }},
  },
];

// Populated by api-spec-generator:
export const bogoEndpoints: Endpoint[] = [];
export const announcementBarEndpoints: Endpoint[] = [];
export const volumeDiscountEndpoints: Endpoint[] = [];
export const analyticsEndpoints: Endpoint[] = [];
export const referralEndpoints: Endpoint[] = [];
