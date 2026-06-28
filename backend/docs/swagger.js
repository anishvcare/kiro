const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Universal Local Shopping & Delivery Platform API',
      version: '1.0.0',
      description: 'Complete REST API for the local shopping and delivery platform. Supports customer requests, shop quotations, payments, delivery management, and admin operations.',
      contact: {
        name: 'API Support',
        email: 'support@localshop.com',
      },
    },
    servers: [
      { url: '/api', description: 'API Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            is_active: { type: 'boolean' },
            is_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Shop: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            is_active: { type: 'boolean' },
            rating: { type: 'number' },
          },
        },
        CustomerRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            customer_id: { type: 'string', format: 'uuid' },
            shop_id: { type: 'string', format: 'uuid' },
            request_text: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'viewed', 'quoted', 'accepted', 'rejected', 'cancelled', 'completed'] },
            urgency: { type: 'string', enum: ['normal', 'urgent', 'scheduled'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Quotation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            request_id: { type: 'string', format: 'uuid' },
            total_amount: { type: 'number' },
            delivery_charge: { type: 'number' },
            final_amount: { type: 'number' },
            status: { type: 'string', enum: ['sent', 'viewed', 'accepted', 'rejected', 'expired'] },
          },
        },
        PaymentTransaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            payment_method: { type: 'string' },
            status: { type: 'string', enum: ['initiated', 'pending', 'success', 'failed', 'refunded'] },
            paid_at: { type: 'string', format: 'date-time' },
          },
        },
        DeliveryAssignment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'] },
            estimated_delivery_time: { type: 'string', format: 'date-time' },
            actual_delivery_time: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email', 'password', 'first_name', 'role'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 }, first_name: { type: 'string' }, last_name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string', enum: ['customer', 'shop_owner', 'delivery_agent', 'delivery_boy'] } } } } },
          },
          responses: { '201': { description: 'User registered successfully' }, '400': { description: 'Validation error' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login with email and password',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Login successful, returns JWT token' }, '401': { description: 'Invalid credentials' } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          responses: { '200': { description: 'New tokens issued' } },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset email',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } } },
          },
          responses: { '200': { description: 'Reset email sent' } },
        },
      },
      '/search/shops': {
        get: {
          tags: ['Search'],
          summary: 'Search shops by keyword and location',
          security: [],
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search keyword' },
            { name: 'lat', in: 'query', schema: { type: 'number' }, description: 'Latitude' },
            { name: 'lng', in: 'query', schema: { type: 'number' }, description: 'Longitude' },
            { name: 'radius', in: 'query', schema: { type: 'number' }, description: 'Search radius in km' },
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category filter' },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of matching shops' } },
        },
      },
      '/search/categories': {
        get: {
          tags: ['Search'],
          summary: 'Get all shop categories',
          security: [],
          responses: { '200': { description: 'List of categories' } },
        },
      },
      '/shop/profile': {
        get: {
          tags: ['Shop'],
          summary: 'Get current shop profile',
          responses: { '200': { description: 'Shop profile data' } },
        },
        put: {
          tags: ['Shop'],
          summary: 'Update shop profile',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, address: { type: 'string' }, phone: { type: 'string' } } } } },
          },
          responses: { '200': { description: 'Shop updated' } },
        },
      },
      '/shop/register': {
        post: {
          tags: ['Shop'],
          summary: 'Register a new shop',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['name', 'address', 'city'], properties: { name: { type: 'string' }, description: { type: 'string' }, address: { type: 'string' }, city: { type: 'string' }, category_id: { type: 'integer' } } } } },
          },
          responses: { '201': { description: 'Shop registered' } },
        },
      },
      '/shop/requests': {
        get: {
          tags: ['Shop'],
          summary: 'Get requests sent to the shop',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of customer requests' } },
        },
      },
      '/requests': {
        post: {
          tags: ['Requests'],
          summary: 'Create a customer request',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['shop_id', 'request_text'], properties: { shop_id: { type: 'string', format: 'uuid' }, request_text: { type: 'string' }, delivery_address: { type: 'string' }, urgency: { type: 'string', enum: ['normal', 'urgent', 'scheduled'] } } } } },
          },
          responses: { '201': { description: 'Request created' } },
        },
        get: {
          tags: ['Requests'],
          summary: 'Get customer requests (for customer)',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of requests' } },
        },
      },
      '/requests/{id}': {
        get: {
          tags: ['Requests'],
          summary: 'Get request details',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Request details' } },
        },
      },
      '/quotations': {
        post: {
          tags: ['Quotations'],
          summary: 'Create a quotation for a request',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['request_id', 'items', 'total_amount', 'final_amount'], properties: { request_id: { type: 'string', format: 'uuid' }, items: { type: 'array', items: { type: 'object', properties: { item_name: { type: 'string' }, quantity: { type: 'integer' }, unit_price: { type: 'number' } } } }, total_amount: { type: 'number' }, delivery_charge: { type: 'number' }, final_amount: { type: 'number' } } } } },
          },
          responses: { '201': { description: 'Quotation created' } },
        },
      },
      '/quotations/{id}/accept': {
        patch: {
          tags: ['Quotations'],
          summary: 'Accept a quotation',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Quotation accepted' } },
        },
      },
      '/quotations/{id}/reject': {
        patch: {
          tags: ['Quotations'],
          summary: 'Reject a quotation',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Quotation rejected' } },
        },
      },
      '/payments/initiate': {
        post: {
          tags: ['Payments'],
          summary: 'Initiate a payment for an accepted quotation',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['quotation_id', 'payment_method'], properties: { quotation_id: { type: 'string', format: 'uuid' }, payment_method: { type: 'string', enum: ['upi', 'cod', 'bank_transfer', 'wallet'] } } } } },
          },
          responses: { '201': { description: 'Payment initiated' } },
        },
      },
      '/payments/{id}/confirm': {
        patch: {
          tags: ['Payments'],
          summary: 'Confirm payment completion',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Payment confirmed' } },
        },
      },
      '/payments/{id}/screenshot': {
        post: {
          tags: ['Payments'],
          summary: 'Upload payment screenshot',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: { 'multipart/form-data': { schema: { type: 'object', properties: { screenshot: { type: 'string', format: 'binary' } } } } },
          },
          responses: { '200': { description: 'Screenshot uploaded' } },
        },
      },
      '/delivery/assignments': {
        get: {
          tags: ['Delivery'],
          summary: 'Get delivery assignments',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of assignments' } },
        },
      },
      '/delivery/assign': {
        post: {
          tags: ['Delivery'],
          summary: 'Assign a delivery to a delivery boy',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['transaction_id', 'delivery_boy_id'], properties: { transaction_id: { type: 'string', format: 'uuid' }, delivery_boy_id: { type: 'string', format: 'uuid' } } } } },
          },
          responses: { '201': { description: 'Delivery assigned' } },
        },
      },
      '/delivery/assignments/{id}/status': {
        patch: {
          tags: ['Delivery'],
          summary: 'Update delivery status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['picked_up', 'in_transit', 'delivered', 'failed'] } } } } },
          },
          responses: { '200': { description: 'Status updated' } },
        },
      },
      '/delivery/location': {
        post: {
          tags: ['Delivery'],
          summary: 'Update delivery boy live location',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { assignment_id: { type: 'string', format: 'uuid' }, latitude: { type: 'number' }, longitude: { type: 'number' } } } } },
          },
          responses: { '200': { description: 'Location updated' } },
        },
      },
      '/delivery/boys': {
        get: {
          tags: ['Delivery'],
          summary: 'List delivery boys (for agent)',
          responses: { '200': { description: 'List of delivery boys' } },
        },
      },
      '/chat/conversations': {
        get: {
          tags: ['Chat'],
          summary: 'Get all conversations for the user',
          responses: { '200': { description: 'List of conversations' } },
        },
      },
      '/chat/conversations/{id}/messages': {
        get: {
          tags: ['Chat'],
          summary: 'Get messages for a conversation',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of messages' } },
        },
      },
      '/chat/send': {
        post: {
          tags: ['Chat'],
          summary: 'Send a message',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['chat_id', 'content'], properties: { chat_id: { type: 'string', format: 'uuid' }, content: { type: 'string' }, message_type: { type: 'string', enum: ['text', 'image', 'file'] } } } } },
          },
          responses: { '201': { description: 'Message sent' } },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notifications for current user',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'unread', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { '200': { description: 'List of notifications' } },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Marked as read' } },
        },
      },
      '/settlements': {
        get: {
          tags: ['Settlements'],
          summary: 'Get settlement transactions',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of settlements' } },
        },
      },
      '/settlements/initiate': {
        post: {
          tags: ['Settlements'],
          summary: 'Initiate a settlement to shop or delivery partner',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { to_type: { type: 'string' }, to_id: { type: 'string', format: 'uuid' }, amount: { type: 'number' } } } } },
          },
          responses: { '201': { description: 'Settlement initiated' } },
        },
      },
      '/admin/stats': {
        get: {
          tags: ['Admin'],
          summary: 'Get admin dashboard statistics',
          responses: { '200': { description: 'Dashboard stats' } },
        },
      },
      '/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'List all users with filters',
          parameters: [
            { name: 'role', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'List of users' } },
        },
      },
      '/admin/users/{id}/status': {
        patch: {
          tags: ['Admin'],
          summary: 'Update user active status',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { is_active: { type: 'boolean' } } } } },
          },
          responses: { '200': { description: 'User status updated' } },
        },
      },
      '/admin/shops': {
        get: {
          tags: ['Admin'],
          summary: 'List all shops for admin',
          responses: { '200': { description: 'List of shops' } },
        },
      },
      '/admin/shops/{id}/approve': {
        patch: {
          tags: ['Admin'],
          summary: 'Approve a shop',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Shop approved' } },
        },
      },
      '/admin/reports/revenue': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Get revenue report',
          parameters: [
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Revenue report data' } },
        },
      },
      '/admin/reports/daily-requests': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Get daily requests report',
          parameters: [
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Daily requests data' } },
        },
      },
      '/admin/reports/completed-deliveries': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Get completed deliveries report',
          parameters: [
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Completed deliveries data' } },
        },
      },
      '/admin/reports/summary': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Get summary report',
          parameters: [
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Summary report data' } },
        },
      },
      '/admin/reports/export/excel': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Export report data to Excel format',
          parameters: [
            { name: 'report_type', in: 'query', required: true, schema: { type: 'string', enum: ['revenue', 'daily-requests', 'completed-deliveries', 'cash-collections', 'delivery-performance', 'summary'] } },
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'Excel file download', content: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { schema: { type: 'string', format: 'binary' } } } } },
        },
      },
      '/admin/reports/export/pdf': {
        get: {
          tags: ['Admin Reports'],
          summary: 'Export report data to PDF format',
          parameters: [
            { name: 'report_type', in: 'query', required: true, schema: { type: 'string', enum: ['revenue', 'daily-requests', 'completed-deliveries', 'cash-collections', 'delivery-performance', 'summary'] } },
            { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'PDF file download', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } } },
        },
      },
      '/admin/categories': {
        get: {
          tags: ['Admin'],
          summary: 'List all categories',
          responses: { '200': { description: 'Categories list' } },
        },
        post: {
          tags: ['Admin'],
          summary: 'Create a new category',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, icon: { type: 'string' } } } } },
          },
          responses: { '201': { description: 'Category created' } },
        },
      },
      '/admin/service-areas': {
        get: {
          tags: ['Admin'],
          summary: 'List all service areas',
          responses: { '200': { description: 'Service areas list' } },
        },
        post: {
          tags: ['Admin'],
          summary: 'Create a new service area',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['name', 'city'], properties: { name: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, pincode: { type: 'string' }, radius_km: { type: 'integer' } } } } },
          },
          responses: { '201': { description: 'Service area created' } },
        },
      },
      '/admin/support-tickets': {
        get: {
          tags: ['Admin'],
          summary: 'List support tickets',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'priority', in: 'query', schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Support tickets list' } },
        },
      },
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check endpoint',
          security: [],
          responses: { '200': { description: 'Server is running' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
