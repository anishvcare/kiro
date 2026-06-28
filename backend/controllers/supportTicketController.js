const { Op } = require('sequelize');
const { SupportTicket, User, AuditLog } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * List support tickets
 * GET /api/admin/support-tickets
 */
const listTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, search } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where[Op.or] = [
      { subject: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await SupportTicket.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    order: [
      ['priority', 'DESC'],
      ['created_at', 'DESC'],
    ],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Support tickets retrieved', {
    tickets: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get single ticket
 * GET /api/admin/support-tickets/:id
 */
const getTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await SupportTicket.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] }],
  });

  if (!ticket) {
    return apiResponse(res, 404, 'Ticket not found');
  }

  return apiResponse(res, 200, 'Ticket retrieved', { ticket });
});

/**
 * Update ticket status
 * PATCH /api/admin/support-tickets/:id
 */
const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority, assigned_to } = req.body;

  const ticket = await SupportTicket.findByPk(id);
  if (!ticket) {
    return apiResponse(res, 404, 'Ticket not found');
  }

  const oldValues = { status: ticket.status, priority: ticket.priority, assigned_to: ticket.assigned_to };

  const updates = {};
  if (status) {
    updates.status = status;
    if (status === 'resolved') {
      updates.resolved_at = new Date();
    }
  }
  if (priority) updates.priority = priority;
  if (assigned_to) updates.assigned_to = assigned_to;

  await ticket.update(updates);

  await AuditLog.create({
    user_id: req.user.id,
    action: 'update_support_ticket',
    entity_type: 'support_ticket',
    entity_id: id,
    old_values: oldValues,
    new_values: updates,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Ticket updated successfully', { ticket });
});

module.exports = {
  listTickets,
  getTicket,
  updateTicket,
};
