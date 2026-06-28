import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCashReport } from '../../store/slices/deliverySlice';

const CashReport = () => {
  const dispatch = useDispatch();
  const { cashReport, isLoading } = useSelector((state) => state.delivery);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = filter !== 'all' ? { settled: filter } : {};
    dispatch(fetchCashReport(params));
  }, [dispatch, filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cash Report</h1>

      {/* Summary Cards */}
      {cashReport?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">Rs. {cashReport.summary.total_collected?.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Settled</p>
            <p className="text-2xl font-bold text-blue-600">Rs. {cashReport.summary.total_settled?.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-orange-600">Rs. {cashReport.summary.total_pending?.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex space-x-2">
        {['all', 'true', 'false'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md ${
              filter === f ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'true' ? 'Settled' : 'Pending'}
          </button>
        ))}
      </div>

      {/* Collections Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Boy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cashReport?.collections?.map((collection) => (
              <tr key={collection.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {collection.deliveryBoy?.user?.first_name} {collection.deliveryBoy?.user?.last_name}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Rs. {parseFloat(collection.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {collection.collected_at ? new Date(collection.collected_at).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    collection.settled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {collection.settled ? 'Settled' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {(!cashReport?.collections || cashReport.collections.length === 0) && (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-sm">
                  {isLoading ? 'Loading...' : 'No cash collections found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CashReport;
