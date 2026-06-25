import { useState, useEffect } from 'react';
import { contactsApi } from '../services/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => { load(); }, [search, filter]);

  async function load() {
    try {
      const params = {};
      if (search) params.search = search;
      if (filter) params.status = filter;
      const res = await contactsApi.getAll(params);
      setContacts(res.data);
    } catch (e) {}
  }

  async function updateStatus(id, status) {
    await contactsApi.update(id, { status });
    load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">👥 Contacts</h2>
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search..." className="flex-1 p-2 border rounded-lg text-sm" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="p-2 border rounded-lg text-sm">
          <option value="">All</option>
          <option value="new">New</option>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
        </select>
      </div>
      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center border">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-gray-500 text-sm">WhatsApp connect cheythaal contacts auto-save aakum</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c._id} className="bg-white rounded-lg shadow border p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.name || c.phone}</p>
                  <p className="text-xs text-gray-500">{c.phone} • {c.messageCount} msgs</p>
                </div>
              </div>
              <select value={c.status} onChange={e => updateStatus(c._id, e.target.value)} className="text-xs p-1 border rounded">
                <option value="new">🆕 New</option>
                <option value="lead">🎯 Lead</option>
                <option value="customer">⭐ Customer</option>
                <option value="inactive">😴 Inactive</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
