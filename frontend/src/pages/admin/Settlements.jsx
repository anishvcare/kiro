import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BanknotesIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { fetchSettlementHistory, fetchSettlementReport } from '../../store/slices/paymentSlice';

const Settlements = () => {
  const dispatch = useDispatch();
  const { settlements, settlementReport, pagination, isLoading } = useSelector((state) => state.payment);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchSettlementReport({}));
    dispatch(fetchSettlementHistory({}));
  }, [dispatch]);

  const refreshData = () => {
    dispatch(fetchSettlementReport({}));
    dispatch(fetchSettlementHistory({}));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-800">Settlements</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Track money flow and settlements to shops
              </p>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Report Cards */}
            {settlementReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Total Settled</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    &#8377;{parseFloat(settlementReport.total_settled || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BanknotesIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Pending Settlement</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    &#8377;{parseFloat(settlementReport.pending_settlement || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BanknotesIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Cash Collections</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    &#8377;{parseFloat(settlementReport.total_cash_collections || 0).toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartBarIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Total Transactions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {settlementReport.total_transactions || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {settlementReport.completed_transactions || 0} completed
                  </p>
                </div>
              </div>
            )}

            {/* Summary Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Settlement Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Settled Cash Collections</span>
                  <span className="font-medium">
                    &#8377;{parseFloat(settlementReport?.settled_cash_collections || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">Unsettled Cash</span>
                  <span className="font-medium text-yellow-600">
                    &#8377;{parseFloat(settlementReport?.total_cash_collections || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Pending to Shops</span>
                  <span className="font-medium text-red-600">
                    &#8377;{parseFloat(settlementReport?.pending_settlement || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {isLoading && settlements.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500">No settlement records yet</p>
              </div>
            ) : (
              <>
                {settlements.map((settlement) => (
                  <div key={settlement.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          &#8377;{parseFloat(settlement.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {settlement.from_type} to {settlement.to_type}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        settlement.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : settlement.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {settlement.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <p>{settlement.notes}</p>
                      <p className="mt-1">
                        {new Date(settlement.createdAt || settlement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: pagination.total_pages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => dispatch(fetchSettlementHistory({ page: i + 1 }))}
                        className={`px-3 py-1 rounded text-sm ${
                          pagination.page === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 border hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlements;
