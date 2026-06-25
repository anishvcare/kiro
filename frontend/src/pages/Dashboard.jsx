import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi, flowsApi } from '../services/api';

export default function Dashboard({ status }) {
  const [stats, setStats] = useState({ total: 0, new: 0, leads: 0, customers: 0 });
  const [flowCount, setFlowCount] = useState(0);

  useEffect(() => {
    Promise.all([contactsApi.getStats(), flowsApi.getAll()])
      .then(([c, f]) => { setStats(c.data); setFlowCount(f.data.length); })
      .catch(() => {});
  }, []);

  const connected = status.status === 'connected';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className={`p-4 rounded-lg border-l-4 ${connected ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{connected ? '✅ Connected' : '⚠️ Not Connected'}</h3>
            <p className="text-sm text-gray-600">{status.message}</p>
          </div>
          {!connected && <Link to="/connect" className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm">Connect</Link>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { t: 'Total Contacts', v: stats.total, i: '👥', c: 'bg-blue-50' },
          { t: 'New', v: stats.new, i: '🆕', c: 'bg-green-50' },
          { t: 'Leads', v: stats.leads, i: '🎯', c: 'bg-yellow-50' },
          { t: 'Customers', v: stats.customers, i: '⭐', c: 'bg-purple-50' },
        ].map(s => (
          <div key={s.t} className={`${s.c} p-4 rounded-lg border`}>
            <div className="text-2xl">{s.i}</div>
            <div className="text-2xl font-bold">{s.v}</div>
            <div className="text-xs text-gray-600">{s.t}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/flows" className="p-4 bg-white rounded-lg shadow border hover:shadow-md">
          <h3 className="font-semibold">🔄 Auto-Reply Flows</h3>
          <p className="text-gray-500 text-sm">{flowCount} flows</p>
        </Link>
        <Link to="/contacts" className="p-4 bg-white rounded-lg shadow border hover:shadow-md">
          <h3 className="font-semibold">👥 Contacts</h3>
          <p className="text-gray-500 text-sm">{stats.total} contacts</p>
        </Link>
        <Link to="/chats" className="p-4 bg-white rounded-lg shadow border hover:shadow-md">
          <h3 className="font-semibold">💬 Live Chats</h3>
          <p className="text-gray-500 text-sm">View conversations</p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-5 border">
        <h3 className="font-bold mb-3">🚀 Setup Steps</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          <li>1️⃣ "Connect" tab → QR scan cheyyuka</li>
          <li>2️⃣ "Flows" tab → Auto-reply messages setup</li>
          <li>3️⃣ Bot active! Messages auto-reply cheyyum</li>
          <li>4️⃣ "Contacts" & "Chats" → Monitor cheyyuka</li>
        </ol>
      </div>
    </div>
  );
}
