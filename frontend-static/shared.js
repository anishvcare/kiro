// ============================================================
// Shared JavaScript - WhatsApp CRM Platform
// ============================================================

const API_BASE = '/api';

// --- API Helper ---
async function api(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login/';
    return;
  }
  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

// --- Auth Check ---
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/auth/login/';
  }
}

// --- Get Current User ---
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// --- Logout ---
function logout() {
  api('/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth/login/';
}

// --- Format Date ---
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Format DateTime ---
function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// --- Sidebar Template ---
function renderSidebar(activePage) {
  const user = getUser();
  const userName = user ? user.name : 'User';
  const navItems = [
    { href: '/inbox/', icon: '&#9776;', label: 'Dashboard', id: 'inbox' },
    { href: '/contacts/', icon: '&#128101;', label: 'Contacts', id: 'contacts' },
    { href: '/leads/', icon: '&#128200;', label: 'Leads', id: 'leads' },
    { href: '/campaigns/', icon: '&#128227;', label: 'Campaigns', id: 'campaigns' },
    { href: '/flows/', icon: '&#9881;', label: 'Automations', id: 'flows' },
    { href: '/whatsapp-accounts/', icon: '&#128172;', label: 'WhatsApp', id: 'whatsapp-accounts' },
    { href: '/team/', icon: '&#128101;', label: 'Team', id: 'team' },
    { href: '/reports/', icon: '&#128202;', label: 'Reports', id: 'reports' },
    { href: '/referrals/', icon: '&#127873;', label: 'Referrals', id: 'referrals' },
    { href: '/wa-links/', icon: '&#128279;', label: 'WA Links', id: 'wa-links' },
    { href: '/landing-pages/', icon: '&#128196;', label: 'Landing Pages', id: 'landing-pages' },
    { href: '/settings/', icon: '&#9881;', label: 'Settings', id: 'settings' },
  ];

  const navHtml = navItems.map(item => {
    const activeClass = activePage === item.id ? 'active' : '';
    return `<a href="${item.href}" class="nav-item ${activeClass}"><span class="nav-icon">${item.icon}</span>${item.label}</a>`;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-logo">&#128172; WA CRM</h2>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <span class="user-avatar">${userName.charAt(0).toUpperCase()}</span>
          <span class="user-name">${userName}</span>
        </div>
        <button class="btn-logout" onclick="logout()">Logout</button>
      </div>
    </aside>
    <button class="sidebar-toggle" id="sidebarToggle" onclick="toggleSidebar()">&#9776;</button>
  `;
}

// --- Toggle Sidebar (mobile) ---
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// --- Show Toast/Error ---
function showError(msg, container) {
  const el = container || document.getElementById('errorMsg');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
}

function showSuccess(msg, container) {
  const el = container || document.getElementById('successMsg');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }
}

// --- Modal Helpers ---
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// --- Loading State ---
function setLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Loading...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Submit';
  }
}
