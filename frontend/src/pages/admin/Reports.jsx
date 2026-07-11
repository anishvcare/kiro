import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportData } from '../../store/slices/adminSlice';

// How often to refresh the report for real-time data (ms).
const REFRESH_INTERVAL = 15000;

const fmtCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v) || 0);

// Column keys that represent money amounts (rendered as INR currency).
const CURRENCY_KEYS = new Set(['total_amount', 'totalamount', 'amount', 'revenue', 'income', 'final_amount', 'delivery_charge']);

// Render a table cell readably: currency for amount columns, readable text for
// nested objects (e.g. a shop object) instead of raw JSON.
const formatCell = (key, val) => {
  if (val === null || val === undefined || val === '') return '-';
  if (typeof val === 'object') {
    // Prefer a human-readable name for person/shop objects.
    if (val.user && (val.user.first_name || val.user.last_name)) {
      return `${val.user.first_name || ''} ${val.user.last_name || ''}`.trim();
    }
    if (val.name) return val.name;
    if (val.first_name || val.last_name) {
      return `${val.first_name || ''} ${val.last_name || ''}`.trim();
    }
    // Fallback: readable list of scalar values (never raw JSON).
    const parts = Object.values(val).filter((v) => v !== null && v !== undefined && v !== '' && typeof v !== 'object');
    return parts.length ? parts.join(' \u2014 ') : '-';
  }
  if (CURRENCY_KEYS.has(String(key).toLowerCase())) {
    return fmtCurrency(val);
  }
  return String(val);
};


const reportTypes = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'daily-requests', label: 'Daily Requests' },
  { key: 'completed-deliveries', label: 'Completed Deliveries' },
  { key: 'cash-collections', label: 'Cash Collections' },
  { key: 'upi-payments', label: 'UPI Payments' },
  { key: 'shop-settlements', label: 'Shop Settlements' },
  { key: 'delivery-performance', label: 'Delivery Performance' },
  { key: 'summary', label: 'Summary' },
  { key: 'user-statistics', label: 'User Statistics' },
];

const Reports = () => {
  const dispatch = useDispatch();
  const { reports } = useSelector((state) => state.admin);
  const [activeReport, setActiveReport] = useState('revenue');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  // Keep the latest values available to the polling interval without resetting it.
  const paramsRef = useRef({ activeReport, startDate, endDate });
  paramsRef.current = { activeReport, startDate, endDate };

  const fetchNow = useCallback(() => {
    const { activeReport: rt, startDate: s, endDate: e } = paramsRef.current;
    dispatch(fetchReportData({ reportType: rt, params: { start_date: s, end_date: e } }));
  }, [dispatch]);

  // Load immediately when the report type or date range changes.
  useEffect(() => {
    fetchNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport, startDate, endDate]);

  // Keep data fresh in the background (real-time) without any visible controls.
  useEffect(() => {
    const timer = setInterval(fetchNow, REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchNow]);

  const handleFetchReport = () => fetchNow();

  const currentReport = reports[activeReport];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((rt) => (
          <button
            key={rt.key}
            onClick={() => setActiveReport(rt.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              activeReport === rt.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {rt.label}
          </button>
        ))}
      </div>

      {/* Date Range */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            />
          </div>
          <button
            onClick={handleFetchReport}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Results */}
      <div className="bg-white rounded-lg shadow p-6">
        {!currentReport ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2">Select a report type and date range, then click Generate Report</p>
          </div>
        ) : activeReport === 'summary' && currentReport.summary ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{currentReport.summary.totalRequests}</p>
              <p className="text-sm text-blue-600">Total Requests</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{currentReport.summary.totalDeliveries}</p>
              <p className="text-sm text-green-600">Deliveries</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">
                {fmtCurrency(currentReport.summary.totalIncome ?? currentReport.summary.totalRevenue)}
              </p>
              <p className="text-sm text-yellow-600">Income</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">
                {fmtCurrency(currentReport.summary.pendingAmount)}
              </p>
              <p className="text-sm text-red-600">Pending Amount</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{currentReport.summary.totalUsers ?? '-'}</p>
              <p className="text-sm text-indigo-600">Total Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{currentReport.summary.newShops}</p>
              <p className="text-sm text-purple-600">New Shops</p>
            </div>
          </div>
        ) : currentReport.data ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reportTypes.find((r) => r.key === activeReport)?.label} Results
            </h3>
            {Array.isArray(currentReport.data) && currentReport.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(currentReport.data[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentReport.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.entries(row).map(([key, val], i) => (
                          <td key={i} className="px-4 py-2 text-sm text-gray-700">
                            {formatCell(key, val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available for the selected period</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
