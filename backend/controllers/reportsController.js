const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const {
  CustomerRequest,
  DeliveryAssignment,
  PaymentTransaction,
  CashCollection,
  UpiPaymentLog,
  DeliveryBoy,
  Shop,
  User,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * Get daily requests report
 * GET /api/admin/reports/daily-requests
 */
const getDailyRequests = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const requests = await CustomerRequest.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
    },
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    raw: true,
  });

  return apiResponse(res, 200, 'Daily requests report', { data: requests, startDate, endDate });
});

/**
 * Get completed deliveries report
 * GET /api/admin/reports/completed-deliveries
 */
const getCompletedDeliveries = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const deliveries = await DeliveryAssignment.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: {
      status: 'delivered',
      actual_delivery_time: { [Op.between]: [startDate, endDate] },
    },
    group: [sequelize.fn('DATE', sequelize.col('actual_delivery_time'))],
    order: [[sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'ASC']],
    raw: true,
  });

  return apiResponse(res, 200, 'Completed deliveries report', { data: deliveries, startDate, endDate });
});

/**
 * Get revenue report
 * GET /api/admin/reports/revenue
 */
const getRevenueReport = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const revenue = await PaymentTransaction.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('paid_at')), 'date'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    where: {
      status: 'success',
      paid_at: { [Op.between]: [startDate, endDate] },
    },
    group: [sequelize.fn('DATE', sequelize.col('paid_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('paid_at')), 'ASC']],
    raw: true,
  });

  const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

  return apiResponse(res, 200, 'Revenue report', { data: revenue, totalRevenue, startDate, endDate });
});

/**
 * Get cash collection report
 * GET /api/admin/reports/cash-collections
 */
const getCashCollections = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const collections = await CashCollection.findAll({
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
    },
    include: [
      { model: DeliveryBoy, as: 'deliveryBoy', include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }] },
    ],
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Cash collections report', { data: collections, startDate, endDate });
});

/**
 * Get UPI payments report
 * GET /api/admin/reports/upi-payments
 */
const getUpiPayments = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const payments = await UpiPaymentLog.findAll({
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
    },
    include: [
      { model: PaymentTransaction, as: 'transaction', attributes: ['amount', 'status'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'UPI payments report', { data: payments, startDate, endDate });
});

/**
 * Get shop settlements report
 * GET /api/admin/reports/shop-settlements
 */
const getShopSettlements = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const settlements = await PaymentTransaction.findAll({
    attributes: [
      'shop_id',
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      [sequelize.fn('COUNT', sequelize.col('PaymentTransaction.id')), 'transactionCount'],
    ],
    where: {
      status: 'success',
      paid_at: { [Op.between]: [startDate, endDate] },
    },
    include: [{ model: Shop, as: 'shop', attributes: ['name', 'city'] }],
    group: ['shop_id', 'shop.id'],
    order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
    raw: true,
    nest: true,
  });

  return apiResponse(res, 200, 'Shop settlements report', { data: settlements, startDate, endDate });
});

/**
 * Get delivery boy performance report
 * GET /api/admin/reports/delivery-performance
 */
const getDeliveryPerformance = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const performance = await DeliveryAssignment.findAll({
    attributes: [
      'delivery_boy_id',
      [sequelize.fn('COUNT', sequelize.col('DeliveryAssignment.id')), 'totalAssignments'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'delivered' THEN 1 ELSE 0 END")), 'completedDeliveries'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'failedDeliveries'],
    ],
    where: {
      created_at: { [Op.between]: [startDate, endDate] },
    },
    include: [
      { model: DeliveryBoy, as: 'deliveryBoy', include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }] },
    ],
    group: ['delivery_boy_id', 'deliveryBoy.id', 'deliveryBoy->user.id'],
    raw: true,
    nest: true,
  });

  return apiResponse(res, 200, 'Delivery performance report', { data: performance, startDate, endDate });
});

/**
 * Get summary report for export
 * GET /api/admin/reports/summary
 */
const getSummaryReport = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const [totalRequests, totalDeliveries, revenueResult, totalShops] = await Promise.all([
    CustomerRequest.count({
      where: { created_at: { [Op.between]: [startDate, endDate] } },
    }),
    DeliveryAssignment.count({
      where: { status: 'delivered', created_at: { [Op.between]: [startDate, endDate] } },
    }),
    PaymentTransaction.findOne({
      attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('amount')), 0), 'total']],
      where: { status: 'success', paid_at: { [Op.between]: [startDate, endDate] } },
      raw: true,
    }),
    Shop.count({
      where: { created_at: { [Op.between]: [startDate, endDate] } },
    }),
  ]);

  return apiResponse(res, 200, 'Summary report', {
    summary: {
      totalRequests,
      totalDeliveries,
      totalRevenue: parseFloat(revenueResult?.total || 0),
      newShops: totalShops,
      startDate,
      endDate,
    },
  });
});

/**
 * Export report data to Excel
 * GET /api/admin/reports/export/excel
 */
const exportToExcel = asyncHandler(async (req, res) => {
  const { report_type, start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Local Shopping Platform';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Report');

  // Style for header row
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } },
    alignment: { horizontal: 'center' },
  };

  let data = [];
  let columns = [];

  switch (report_type) {
    case 'revenue': {
      columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Total Revenue', key: 'total', width: 20 },
        { header: 'Transaction Count', key: 'count', width: 20 },
      ];
      data = await PaymentTransaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('paid_at')), 'date'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { status: 'success', paid_at: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('paid_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('paid_at')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'daily-requests': {
      columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Request Count', key: 'count', width: 20 },
      ];
      data = await CustomerRequest.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { created_at: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'completed-deliveries': {
      columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Deliveries Completed', key: 'count', width: 20 },
      ];
      data = await DeliveryAssignment.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { status: 'delivered', actual_delivery_time: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('actual_delivery_time'))],
        order: [[sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'summary': {
      columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 },
      ];
      const [totalRequests, totalDeliveries, revenueResult, totalShops] = await Promise.all([
        CustomerRequest.count({ where: { created_at: { [Op.between]: [startDate, endDate] } } }),
        DeliveryAssignment.count({ where: { status: 'delivered', created_at: { [Op.between]: [startDate, endDate] } } }),
        PaymentTransaction.findOne({
          attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('amount')), 0), 'total']],
          where: { status: 'success', paid_at: { [Op.between]: [startDate, endDate] } },
          raw: true,
        }),
        Shop.count({ where: { created_at: { [Op.between]: [startDate, endDate] } } }),
      ]);
      data = [
        { metric: 'Total Requests', value: totalRequests },
        { metric: 'Completed Deliveries', value: totalDeliveries },
        { metric: 'Total Revenue', value: parseFloat(revenueResult?.total || 0) },
        { metric: 'New Shops', value: totalShops },
      ];
      break;
    }
    default: {
      columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Count', key: 'count', width: 20 },
      ];
      data = [];
    }
  }

  worksheet.columns = columns;

  // Apply header styles
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
  });

  // Add data rows
  data.forEach((row) => worksheet.addRow(row));

  // Add title row at top
  worksheet.insertRow(1, [`${report_type} Report - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`]);
  worksheet.mergeCells(1, 1, 1, columns.length);
  worksheet.getRow(1).font = { bold: true, size: 14 };
  worksheet.getRow(1).alignment = { horizontal: 'center' };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${report_type}-report-${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});

/**
 * Export report data to PDF
 * GET /api/admin/reports/export/pdf
 */
const exportToPdf = asyncHandler(async (req, res) => {
  const { report_type, start_date, end_date } = req.query;
  const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end_date ? new Date(end_date) : new Date();

  let data = [];
  let title = '';
  let headers = [];

  switch (report_type) {
    case 'revenue': {
      title = 'Revenue Report';
      headers = ['Date', 'Total Revenue', 'Transactions'];
      data = await PaymentTransaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('paid_at')), 'date'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { status: 'success', paid_at: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('paid_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('paid_at')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'daily-requests': {
      title = 'Daily Requests Report';
      headers = ['Date', 'Request Count'];
      data = await CustomerRequest.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { created_at: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'completed-deliveries': {
      title = 'Completed Deliveries Report';
      headers = ['Date', 'Deliveries'];
      data = await DeliveryAssignment.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: { status: 'delivered', actual_delivery_time: { [Op.between]: [startDate, endDate] } },
        group: [sequelize.fn('DATE', sequelize.col('actual_delivery_time'))],
        order: [[sequelize.fn('DATE', sequelize.col('actual_delivery_time')), 'ASC']],
        raw: true,
      });
      break;
    }
    case 'summary': {
      title = 'Summary Report';
      headers = ['Metric', 'Value'];
      const [totalRequests, totalDeliveries, revenueResult, totalShops] = await Promise.all([
        CustomerRequest.count({ where: { created_at: { [Op.between]: [startDate, endDate] } } }),
        DeliveryAssignment.count({ where: { status: 'delivered', created_at: { [Op.between]: [startDate, endDate] } } }),
        PaymentTransaction.findOne({
          attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('amount')), 0), 'total']],
          where: { status: 'success', paid_at: { [Op.between]: [startDate, endDate] } },
          raw: true,
        }),
        Shop.count({ where: { created_at: { [Op.between]: [startDate, endDate] } } }),
      ]);
      data = [
        { metric: 'Total Requests', value: totalRequests },
        { metric: 'Completed Deliveries', value: totalDeliveries },
        { metric: 'Total Revenue', value: parseFloat(revenueResult?.total || 0) },
        { metric: 'New Shops', value: totalShops },
      ];
      break;
    }
    default: {
      title = 'Report';
      headers = ['Date', 'Count'];
      data = [];
    }
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${report_type}-report-${Date.now()}.pdf`);

  doc.pipe(res);

  // Title
  doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').text(
    `Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    { align: 'center' }
  );
  doc.moveDown(1);

  // Table
  const tableTop = doc.y;
  const colWidth = (doc.page.width - 100) / headers.length;
  let yPos = tableTop;

  // Draw header
  doc.font('Helvetica-Bold').fontSize(10);
  headers.forEach((header, i) => {
    doc.text(header, 50 + i * colWidth, yPos, { width: colWidth, align: 'left' });
  });
  yPos += 20;
  doc.moveTo(50, yPos).lineTo(doc.page.width - 50, yPos).stroke();
  yPos += 10;

  // Draw rows
  doc.font('Helvetica').fontSize(9);
  data.forEach((row) => {
    if (yPos > doc.page.height - 80) {
      doc.addPage();
      yPos = 50;
    }
    const values = Object.values(row);
    values.forEach((val, i) => {
      doc.text(String(val ?? '-'), 50 + i * colWidth, yPos, { width: colWidth, align: 'left' });
    });
    yPos += 18;
  });

  if (data.length === 0) {
    doc.text('No data available for the selected period.', 50, yPos);
  }

  // Footer
  doc.fontSize(8).text(
    `Generated on ${new Date().toLocaleString()} | Local Shopping Platform`,
    50, doc.page.height - 50, { align: 'center' }
  );

  doc.end();
});

module.exports = {
  getDailyRequests,
  getCompletedDeliveries,
  getRevenueReport,
  getCashCollections,
  getUpiPayments,
  getShopSettlements,
  getDeliveryPerformance,
  getSummaryReport,
  exportToExcel,
  exportToPdf,
};
