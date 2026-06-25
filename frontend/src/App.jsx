import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import socket from './services/socket';
import Dashboard from './pages/Dashboard';
import QRConnect from './pages/QRConnect';
import FlowEditor from './pages/FlowEditor';
import Contacts from './pages/Contacts';
import Chats from './pages/Chats';

function App() {
  const [status, setStatus] = useState({ status: 'disconnected', message: 'Not connected' });
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    socket.on('status', (data) => setStatus(data));
    return () => socket.off('status');
  }, []);

  const statusColor = {
    connected: 'bg-green-500',
    waiting_scan: 'bg-yellow-500',
    disconnected: 'bg-red-500'
  };

  const navItems = [
    { to: '/', label: '📊 Home' },
    { to: '/connect', label: '📱 Connect' },
    { to: '/flows', label: '🔄 Flows' },
    { to: '/contacts', label: '👥 Contacts' },
    { to: '/chats', label: '💬 Chats' },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-[#075E54] text-white sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNav(!showNav)} className="md:hidden p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-bold">WA CRM Bot</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${statusColor[status.status] || 'bg-gray-500'}`}></span>
              <span className="text-xs hidden sm:inline">{status.message}</span>
            </div>
          </div>
          <nav className={`${showNav ? 'block' : 'hidden'} md:block bg-[#064E47]`}>
            <div className="flex flex-col md:flex-row">
              {navItems.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setShowNav(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium ${isActive ? 'bg-[#25D366] text-white' : 'text-gray-200 hover:bg-[#0a6b5c]'}`
                  }>{label}</NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard status={status} />} />
            <Route path="/connect" element={<QRConnect status={status} />} />
            <Route path="/flows" element={<FlowEditor />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/chats" element={<Chats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
