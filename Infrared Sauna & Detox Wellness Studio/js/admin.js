/**
 * AURA & SOLACE - Admin Portal Controller
 * Protected management console for studio directors: Bookings, Clients, Memberships, Slots, Reports
 */

let adminUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  await verifyAdminAuth();
  setupAdminTabs();
  await loadAdminOverview();
  setupAdminEventListeners();
});

async function verifyAdminAuth() {
  try {
    const authData = await API.getMe();
    if (!authData || !authData.authenticated || !authData.user) {
      window.location.href = 'login.html?admin=1&redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    if (authData.user.role !== 'admin') {
      alert("Access Denied: Administrative privileges required.");
      window.location.href = 'dashboard.html';
      return;
    }
    adminUser = authData.user;
    const adminNameEl = document.getElementById('admin-name-display');
    if (adminNameEl) adminNameEl.textContent = adminUser.full_name;
  } catch (e) {
    window.location.href = 'login.html?admin=1';
  }
}

function setupAdminTabs() {
  const tabs = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.admin-tab-panel');

  function showTab(targetId) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === targetId));
    panels.forEach(p => p.classList.toggle('d-none', p.id !== targetId));

    if (targetId === 'bookings-tab') loadAdminBookings();
    if (targetId === 'clients-tab') loadAdminClients();
    if (targetId === 'slots-tab') loadAdminSlots();
    if (targetId === 'inquiries-tab') loadAdminInquiries();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      showTab(tab.dataset.tab);
    });
  });
}

async function loadAdminOverview() {
  try {
    const stats = await API.getAdminStats();
    
    document.getElementById('stat-total-bookings').textContent = stats.total_bookings;
    document.getElementById('stat-today-appointments').textContent = stats.today_appointments;
    document.getElementById('stat-active-members').textContent = stats.active_memberships;
    document.getElementById('stat-total-revenue').textContent = `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Render Service Popularity breakdown
    const distContainer = document.getElementById('service-breakdown-list');
    if (distContainer && stats.service_distribution) {
      distContainer.innerHTML = stats.service_distribution.map(item => `
        <div class="mb-3">
          <div class="d-flex justify-content-between small fw-bold mb-1">
            <span>${item.title}</span>
            <span>${item.booking_count} bookings</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-warning" style="width: ${Math.min(100, item.booking_count * 10)}%"></div>
          </div>
        </div>
      `).join('');
    }

    // Load recent appointments in overview table
    loadAdminBookings(5, 'overview-recent-bookings');
  } catch (err) {
    console.error("Admin stats error:", err);
  }
}

async function loadAdminBookings(limit = 100, targetContainerId = 'all-bookings-table-body') {
  const tbody = document.getElementById(targetContainerId);
  if (!tbody) return;

  const statusFilter = document.getElementById('filter-booking-status')?.value || 'all';
  const dateFilter = document.getElementById('filter-booking-date')?.value || '';
  const searchFilter = document.getElementById('filter-booking-search')?.value || '';

  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Loading appointments...</td></tr>`;

  try {
    const data = await API.getAdminBookings({
      status: statusFilter,
      date: dateFilter,
      search: searchFilter
    });

    const bookings = (data.bookings || []).slice(0, limit);

    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No appointments found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td class="fw-bold font-accent">${b.booking_code}</td>
        <td>
          <div class="fw-semibold text-dark">${b.client_name}</div>
          <div class="small text-muted">${b.client_email} • ${b.client_phone}</div>
        </td>
        <td>
          <div class="text-dark">${b.service_title}</div>
          <div class="small text-muted">${b.duration_min} min</div>
        </td>
        <td>
          <div class="fw-semibold">${b.booking_date}</div>
          <div class="small text-muted">${b.time_slot}</div>
        </td>
        <td>
          <span class="status-pill status-${b.status}">${b.status}</span>
        </td>
        <td class="fw-bold">${b.price > 0 ? '$' + b.price.toFixed(2) : 'Membership'}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Action</button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0">
              <li><button class="dropdown-item text-success" onclick="updateBookingStatus(${b.id}, 'confirmed')"><i class="bi bi-check-circle me-1"></i> Confirm</button></li>
              <li><button class="dropdown-item text-primary" onclick="updateBookingStatus(${b.id}, 'completed')"><i class="bi bi-check2-all me-1"></i> Mark Completed</button></li>
              <li><button class="dropdown-item text-danger" onclick="updateBookingStatus(${b.id}, 'cancelled')"><i class="bi bi-x-circle me-1"></i> Cancel</button></li>
            </ul>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load appointments.</td></tr>`;
  }
}

async function updateBookingStatus(id, newStatus) {
  try {
    await API.updateAdminBooking(id, { status: newStatus });
    Toast.success(`Appointment status updated to ${newStatus}.`);
    loadAdminBookings();
    loadAdminOverview();
  } catch (err) {
    Toast.error(err.message || "Failed to update booking status.");
  }
}

async function loadAdminClients() {
  const tbody = document.getElementById('admin-clients-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Loading clients...</td></tr>`;

  try {
    const data = await API.getAdminClients();
    const clients = data.clients || [];

    if (clients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No registered clients yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = clients.map(c => `
      <tr>
        <td class="fw-bold text-dark">${c.full_name}</td>
        <td>
          <div>${c.email}</div>
          <div class="small text-muted">${c.phone || 'No phone'}</div>
        </td>
        <td>
          ${c.plan_name ? `
            <span class="badge bg-warning text-dark">${c.plan_name}</span>
            <div class="small text-muted mt-1">${c.sessions_used || 0}/${c.session_limit || 0} sessions used</div>
          ` : '<span class="badge bg-light text-muted">No Plan</span>'}
        </td>
        <td>${c.total_bookings} sessions</td>
        <td>${c.preferred_temp || 'Medium (55°C)'}</td>
        <td>
          <button class="btn btn-sm btn-outline-dark rounded-pill px-3" onclick="openClientMembershipModal(${c.id}, '${c.full_name}', '${c.plan_name || ''}', ${c.session_limit || 4}, ${c.sessions_used || 0})">
            <i class="bi bi-gem me-1"></i> Manage Plan
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Error loading clients.</td></tr>`;
  }
}

function openClientMembershipModal(clientId, clientName, currentPlan, limit, used) {
  let modalEl = document.getElementById('adminClientMembershipModal');
  if (!modalEl) {
    const modalHtml = `
      <div class="modal fade" id="adminClientMembershipModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title font-serif fw-bold">Update Client Membership</h5>
              <button type="button" class="btn-close" data-bs-toggle="modal"></button>
            </div>
            <div class="modal-body p-4">
              <h6 class="fw-bold mb-3" id="modal-client-target-name">Client</h6>
              <div class="mb-3">
                <label class="form-label small fw-bold">Select Plan Tier</label>
                <select class="form-select" id="admin-mem-plan-select">
                  <option value="detox-glow-monthly" data-limit="4">Detox Glow Monthly (4 sessions)</option>
                  <option value="sanctuary-vip-unlimited" data-limit="30">Sanctuary VIP Unlimited (30 sessions)</option>
                  <option value="multi-5-pack" data-limit="5">5-Session Wellness Pack (5 sessions)</option>
                  <option value="single-session" data-limit="1">Single Session Pass (1 session)</option>
                </select>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label small fw-bold">Sessions Used</label>
                  <input type="number" class="form-control" id="admin-mem-used" min="0" value="0">
                </div>
                <div class="col-6">
                  <label class="form-label small fw-bold">Session Limit</label>
                  <input type="number" class="form-control" id="admin-mem-limit" min="1" value="4">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Status</label>
                <select class="form-select" id="admin-mem-status">
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="d-grid mt-4">
                <button type="button" class="btn btn-aura-primary" id="save-client-mem-btn">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modalEl = document.getElementById('adminClientMembershipModal');
  }

  document.getElementById('modal-client-target-name').textContent = `Client: ${clientName}`;
  document.getElementById('admin-mem-used').value = used;
  document.getElementById('admin-mem-limit').value = limit;

  const planSelect = document.getElementById('admin-mem-plan-select');
  planSelect.onchange = () => {
    const opt = planSelect.options[planSelect.selectedIndex];
    document.getElementById('admin-mem-limit').value = opt.dataset.limit;
  };

  const saveBtn = document.getElementById('save-client-mem-btn');
  saveBtn.onclick = async () => {
    const planId = planSelect.value;
    const planName = planSelect.options[planSelect.selectedIndex].text.split('(')[0].trim();
    const sessionLimit = parseInt(document.getElementById('admin-mem-limit').value) || 4;
    const sessionsUsed = parseInt(document.getElementById('admin-mem-used').value) || 0;
    const status = document.getElementById('admin-mem-status').value;

    try {
      await API.setAdminClientMembership(clientId, {
        plan_id: planId,
        plan_name: planName,
        session_limit: sessionLimit,
        sessions_used: sessionsUsed,
        status: status,
        validity_days: 30
      });
      Toast.success(`Membership updated for ${clientName}`);
      bootstrap.Modal.getInstance(modalEl).hide();
      loadAdminClients();
    } catch (e) {
      Toast.error(e.message || "Failed to update membership.");
    }
  };

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function loadAdminSlots() {
  const container = document.getElementById('blocked-slots-list');
  if (!container) return;

  try {
    const data = await API.getAdminBlockedSlots();
    const blocked = data.blocked_slots || [];

    if (blocked.length === 0) {
      container.innerHTML = `<div class="p-3 text-muted small text-center">No blocked slots currently. All standard schedule slots are active.</div>`;
      return;
    }

    container.innerHTML = blocked.map(b => `
      <div class="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded-3 border">
        <div>
          <span class="badge bg-danger me-2">Blocked</span>
          <strong>${b.slot_date} at ${b.time_slot}</strong>
          <span class="text-muted small ms-2">(${b.reason || 'Maintenance'})</span>
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="unblockSlotItem(${b.id})">
          <i class="bi bi-trash"></i> Unblock
        </button>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-danger small">Failed to load blocked slots.</div>`;
  }
}

async function unblockSlotItem(id) {
  try {
    await API.unblockSlot(id);
    Toast.success("Slot unblocked.");
    loadAdminSlots();
  } catch (e) {
    Toast.error(e.message || "Failed to unblock slot.");
  }
}

async function loadAdminInquiries() {
  const container = document.getElementById('admin-inquiries-list');
  if (!container) return;

  try {
    const data = await API.getAdminInquiries();
    const inquiries = data.inquiries || [];

    if (inquiries.length === 0) {
      container.innerHTML = `<div class="text-center py-5 text-muted small">No contact messages received yet.</div>`;
      return;
    }

    container.innerHTML = inquiries.map(inq => `
      <div class="card p-3 mb-3 border shadow-sm rounded-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="fw-bold mb-0 text-dark">${inq.name}</h6>
            <div class="small text-muted">${inq.email} • ${inq.phone || 'No phone'}</div>
          </div>
          <span class="badge bg-secondary">${inq.service || 'General'}</span>
        </div>
        <div class="fw-semibold text-dark small mb-1">${inq.subject || 'Inquiry'}</div>
        <p class="small text-secondary mb-2 bg-light p-2 rounded">${inq.message}</p>
        <div class="small text-muted" style="font-size: 0.75rem;">Received: ${inq.created_at}</div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="text-danger small">Failed to load inquiries.</div>`;
  }
}

function setupAdminEventListeners() {
  // Block slot form
  const blockForm = document.getElementById('block-slot-form');
  if (blockForm) {
    blockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const date = document.getElementById('block-date').value;
      const slot = document.getElementById('block-time').value;
      const reason = document.getElementById('block-reason').value.trim();

      if (!date || !slot) {
        Toast.warning("Please choose both date and time slot.");
        return;
      }

      try {
        await API.blockSlot(date, slot, reason);
        Toast.success(`Time slot ${slot} on ${date} blocked successfully.`);
        blockForm.reset();
        loadAdminSlots();
      } catch (err) {
        Toast.error(err.message || "Failed to block slot.");
      }
    });
  }

  // Filter triggers
  ['filter-booking-status', 'filter-booking-date', 'filter-booking-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => loadAdminBookings());
    }
  });
}
