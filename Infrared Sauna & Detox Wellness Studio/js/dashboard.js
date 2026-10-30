/**
 * AURA & SOLACE - Client Dashboard Controller
 * Authenticated client portal: Overview, Bookings, Memberships, Goals, Profile, Notifications
 */

let clientData = null;
let clientBookings = [];
let clientMembership = null;
let clientGoals = null;
let currentRescheduleId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await verifyClientAuth();
  setupDashboardTabs();
  await loadDashboardData();
  setupEventListeners();
});

// Authentication guard
async function verifyClientAuth() {
  try {
    const authData = await API.getMe();
    if (!authData || !authData.authenticated || !authData.user) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    clientData = authData.user;
    clientMembership = authData.membership;

    // Render user greetings
    document.querySelectorAll('.client-name-display').forEach(el => {
      el.textContent = clientData.full_name;
    });
    document.querySelectorAll('.client-email-display').forEach(el => {
      el.textContent = clientData.email;
    });
  } catch (err) {
    window.location.href = 'login.html';
  }
}

// Sidebar Tab switching
function setupDashboardTabs() {
  const navLinks = document.querySelectorAll('.dashboard-nav-item');
  const sections = document.querySelectorAll('.dashboard-tab-content');

  function showTab(targetId) {
    navLinks.forEach(link => {
      if (link.dataset.tab === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    sections.forEach(sec => {
      if (sec.id === targetId) {
        sec.classList.remove('d-none');
      } else {
        sec.classList.add('d-none');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.tab;
      window.location.hash = target;
      showTab(target);
    });
  });

  // Check URL hash on page load
  const currentHash = window.location.hash.replace('#', '');
  if (currentHash && document.getElementById(currentHash)) {
    showTab(currentHash);
  } else {
    showTab('overview');
  }
}

async function loadDashboardData() {
  await Promise.all([
    loadBookings(),
    loadMembership(),
    loadWellnessGoals(),
    loadNotifications(),
    loadProfile()
  ]);
  renderOverviewCards();
}

async function loadBookings() {
  try {
    const data = await API.getMyBookings();
    clientBookings = data.bookings || [];
    renderBookingsTable(clientBookings);
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

function renderBookingsTable(bookings) {
  const upcomingContainer = document.getElementById('upcoming-bookings-list');
  const historyContainer = document.getElementById('history-bookings-list');
  const emptyUpcoming = document.getElementById('empty-upcoming-bookings');
  const emptyHistory = document.getElementById('empty-history-bookings');

  if (!upcomingContainer || !historyContainer) return;

  const todayStr = new Date().toISOString().split('T')[0];

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'rescheduled');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  // Render Upcoming
  if (upcoming.length === 0) {
    upcomingContainer.innerHTML = '';
    if (emptyUpcoming) emptyUpcoming.classList.remove('d-none');
  } else {
    if (emptyUpcoming) emptyUpcoming.classList.add('d-none');
    upcomingContainer.innerHTML = upcoming.map(b => `
      <div class="card p-3 mb-3 border shadow-sm rounded-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; font-size: 1.3rem;">
              <i class="bi bi-calendar-event"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h6 class="fw-bold mb-0 text-dark">${b.service_title}</h6>
                <span class="status-pill status-${b.status}">${b.status}</span>
              </div>
              <div class="small text-muted mt-1">
                <i class="bi bi-clock me-1"></i> ${b.booking_date} at <strong>${b.time_slot}</strong> (${b.duration_min} min)
                <span class="ms-2 badge bg-light text-secondary border">REF: ${b.booking_code}</span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 ms-auto">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openRescheduleModal(${b.id}, '${b.booking_date}', '${b.time_slot}', '${b.service_title}')">
              <i class="bi bi-arrow-repeat me-1"></i> Reschedule
            </button>
            <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="confirmCancelBooking(${b.id})">
              <i class="bi bi-x-circle me-1"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render History
  if (past.length === 0) {
    historyContainer.innerHTML = '';
    if (emptyHistory) emptyHistory.classList.remove('d-none');
  } else {
    if (emptyHistory) emptyHistory.classList.add('d-none');
    historyContainer.innerHTML = past.map(b => `
      <div class="card p-3 mb-2 border-0 bg-white shadow-sm rounded-3">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="fw-semibold text-dark">${b.service_title}</span>
              <span class="status-pill status-${b.status}">${b.status}</span>
            </div>
            <div class="small text-muted mt-1">
              ${b.booking_date} at ${b.time_slot} • Ref: ${b.booking_code}
            </div>
          </div>
          <div class="text-end">
            <span class="small fw-semibold text-muted">${b.price > 0 ? '$' + b.price.toFixed(2) : 'Membership Pass'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function renderOverviewCards() {
  // Upcoming countdown & primary appointment
  const upcomingCard = document.getElementById('overview-next-appointment');
  const upcoming = clientBookings.filter(b => b.status === 'confirmed' || b.status === 'rescheduled');

  if (upcomingCard) {
    if (upcoming.length > 0) {
      const next = upcoming[0];
      upcomingCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="aura-badge badge-amber">Upcoming Session</span>
          <span class="badge bg-dark">${next.booking_code}</span>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-1">${next.service_title}</h4>
        <p class="text-muted small mb-3">
          <i class="bi bi-calendar-check text-warning me-1"></i> ${next.booking_date} at <strong>${next.time_slot}</strong>
        </p>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-pill" onclick="openRescheduleModal(${next.id}, '${next.booking_date}', '${next.time_slot}', '${next.service_title}')">
            Reschedule
          </button>
          <a href="dashboard.html#bookings" class="btn btn-sm btn-outline-dark rounded-pill">
            View All
          </a>
        </div>
      `;
    } else {
      upcomingCard.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-calendar-heart display-6 text-warning mb-2 d-block"></i>
          <h5 class="fw-bold mb-1">No upcoming sessions</h5>
          <p class="small text-muted mb-3">Take some time for yourself this week.</p>
          <a href="book.html" class="btn btn-aura-primary btn-sm rounded-pill">
            <i class="bi bi-plus-circle me-1"></i> Book a Session
          </a>
        </div>
      `;
    }
  }

  // Membership Overview Widget
  const memWidget = document.getElementById('overview-membership-widget');
  if (memWidget) {
    if (clientMembership && clientMembership.status === 'active') {
      const remaining = clientMembership.session_limit - clientMembership.sessions_used;
      const pct = Math.min(100, Math.round((clientMembership.sessions_used / clientMembership.session_limit) * 100));
      memWidget.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="fw-bold mb-0 text-dark">${clientMembership.plan_name}</h6>
          <span class="status-pill status-active">Active</span>
        </div>
        <div class="display-6 fw-bold text-warning mb-1">${remaining} <span class="fs-6 text-muted fw-normal">sessions left</span></div>
        <div class="progress mb-2" style="height: 8px;">
          <div class="progress-bar bg-warning" role="progressbar" style="width: ${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="d-flex justify-content-between small text-muted">
          <span>Used: ${clientMembership.sessions_used}/${clientMembership.session_limit}</span>
          <span>Renews: ${clientMembership.end_date}</span>
        </div>
      `;
    } else {
      memWidget.innerHTML = `
        <h6 class="fw-bold text-dark mb-1">No Active Membership</h6>
        <p class="small text-muted mb-3">Save up to 35% on every sweat session with our flexible monthly plans.</p>
        <a href="memberships.html" class="btn btn-aura-secondary btn-sm rounded-pill w-100">
          Explore Membership Plans
        </a>
      `;
    }
  }
}

async function loadMembership() {
  const memContainer = document.getElementById('membership-details-content');
  if (!memContainer) return;

  try {
    const data = await API.getMyMemberships();
    const memberships = data.memberships || [];

    if (memberships.length === 0) {
      memContainer.innerHTML = `
        <div class="card p-4 text-center border-0 bg-white shadow-sm rounded-4">
          <i class="bi bi-gem display-5 text-warning mb-3"></i>
          <h4 class="fw-bold mb-2">You don't have an active membership yet</h4>
          <p class="text-muted small max-w-md mx-auto mb-4">
            Members enjoy discounted session rates, rollover credits, free red light upgrades, and guest passes.
          </p>
          <div>
            <a href="memberships.html" class="btn btn-aura-primary">View Membership Tiers</a>
          </div>
        </div>
      `;
      return;
    }

    const active = memberships.find(m => m.status === 'active');
    const past = memberships.filter(m => m.status !== 'active');

    let html = '';
    if (active) {
      const remaining = active.session_limit - active.sessions_used;
      const pct = Math.min(100, Math.round((active.sessions_used / active.session_limit) * 100));

      html += `
        <div class="card p-4 border-2 border-warning shadow-sm rounded-4 mb-4 bg-white">
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div>
              <span class="aura-badge badge-amber mb-1">Current Active Plan</span>
              <h3 class="font-serif fw-bold text-dark mb-0">${active.plan_name}</h3>
            </div>
            <span class="badge bg-success fs-6 py-2 px-3 rounded-pill">Active</span>
          </div>

          <div class="row g-3 my-2">
            <div class="col-sm-4">
              <div class="bg-light p-3 rounded-3 text-center border">
                <div class="text-muted small">Total Included</div>
                <div class="fs-3 fw-bold text-dark">${active.session_limit}</div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="bg-light p-3 rounded-3 text-center border">
                <div class="text-muted small">Sessions Completed</div>
                <div class="fs-3 fw-bold text-secondary">${active.sessions_used}</div>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="bg-amber-subtle p-3 rounded-3 text-center border border-warning">
                <div class="text-warning-emphasis small fw-bold">Remaining Sessions</div>
                <div class="fs-3 fw-bold text-warning">${remaining}</div>
              </div>
            </div>
          </div>

          <div class="my-3">
            <div class="d-flex justify-content-between small text-muted mb-1">
              <span>Usage Progress</span>
              <span>${pct}% used</span>
            </div>
            <div class="progress" style="height: 10px;">
              <div class="progress-bar bg-warning" role="progressbar" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top text-muted small">
            <div>
              <i class="bi bi-calendar3 me-1"></i> Valid from <strong>${active.start_date}</strong> to <strong>${active.end_date}</strong>
            </div>
            <div class="d-flex gap-2 mt-2 mt-sm-0">
              <a href="book.html" class="btn btn-sm btn-aura-primary">Book Next Session</a>
              <a href="memberships.html" class="btn btn-sm btn-outline-secondary">Upgrade Tier</a>
            </div>
          </div>
        </div>
      `;
    }

    if (past.length > 0) {
      html += `
        <h5 class="fw-bold text-dark mb-3">Past Membership History</h5>
        <div class="list-group shadow-sm border-0">
          ${past.map(m => `
            <div class="list-group-item d-flex justify-content-between align-items-center py-3">
              <div>
                <strong class="text-dark">${m.plan_name}</strong>
                <div class="small text-muted">${m.start_date} to ${m.end_date} • ${m.sessions_used}/${m.session_limit} used</div>
              </div>
              <span class="status-pill status-${m.status}">${m.status}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    memContainer.innerHTML = html;
  } catch (err) {
    console.error("Error loading membership details:", err);
  }
}

async function loadWellnessGoals() {
  try {
    const data = await API.getWellnessGoals();
    clientGoals = data.goal || {};
    const history = data.history || [];

    // Populate Goal View & Form
    const targetInput = document.getElementById('goal-target-sessions');
    const goalTextInput = document.getElementById('goal-text');
    const focusSelect = document.getElementById('goal-focus-area');
    const notesInput = document.getElementById('goal-notes');

    if (targetInput) targetInput.value = clientGoals.target_sessions_per_month || 8;
    if (goalTextInput) goalTextInput.value = clientGoals.goal_text || '';
    if (focusSelect) focusSelect.value = clientGoals.focus_area || 'Deep Muscle Recovery & Circulation';
    if (notesInput) notesInput.value = clientGoals.notes || '';

    // Render Stats
    const completedEl = document.getElementById('goal-completed-stat');
    const targetEl = document.getElementById('goal-target-stat');
    const streakEl = document.getElementById('goal-streak-stat');
    const progressEl = document.getElementById('goal-progress-bar');

    const completed = clientGoals.completed_this_month || 0;
    const target = clientGoals.target_sessions_per_month || 8;
    const streak = clientGoals.current_streak_weeks || 1;
    const pct = Math.min(100, Math.round((completed / target) * 100));

    if (completedEl) completedEl.textContent = completed;
    if (targetEl) targetEl.textContent = target;
    if (streakEl) streakEl.textContent = `${streak} Weeks 🔥`;
    if (progressEl) {
      progressEl.style.width = `${pct}%`;
      progressEl.textContent = `${pct}%`;
    }

    // Render Recent Sessions Log
    const logContainer = document.getElementById('wellness-session-log');
    if (logContainer) {
      if (history.length === 0) {
        logContainer.innerHTML = `<div class="text-muted text-center py-3 small">No completed sessions logged yet. Your sessions will appear here automatically!</div>`;
      } else {
        logContainer.innerHTML = history.map(item => `
          <div class="p-3 bg-light rounded-3 mb-2 border d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-bold text-dark small">${item.service_title}</div>
              <div class="text-muted small">${item.booking_date} at ${item.time_slot}</div>
              ${item.notes ? `<div class="text-secondary small fst-italic mt-1">${item.notes}</div>` : ''}
            </div>
            <span class="badge bg-success-subtle text-success border border-success-subtle">Completed</span>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error("Error loading wellness goals:", err);
  }
}

async function loadNotifications() {
  const container = document.getElementById('notifications-list-container');
  const countBadge = document.getElementById('unread-notif-count');
  if (!container) return;

  try {
    const data = await API.getNotifications();
    const notifs = data.notifications || [];
    const unread = notifs.filter(n => !n.is_read).length;

    if (countBadge) {
      if (unread > 0) {
        countBadge.textContent = unread;
        countBadge.classList.remove('d-none');
      } else {
        countBadge.classList.add('d-none');
      }
    }

    if (notifs.length === 0) {
      container.innerHTML = `<div class="text-center py-5 text-muted small">You have no notifications right now.</div>`;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="card p-3 mb-2 border ${n.is_read ? 'bg-white opacity-75' : 'bg-amber-subtle border-warning'} rounded-3">
        <div class="d-flex justify-content-between align-items-start">
          <div class="d-flex align-items-start gap-2">
            <i class="bi ${n.is_read ? 'bi-bell text-secondary' : 'bi-bell-fill text-warning'} fs-5 mt-1"></i>
            <div>
              <h6 class="fw-bold mb-1 text-dark">${n.title}</h6>
              <p class="small text-secondary mb-1">${n.message}</p>
              <span class="text-muted" style="font-size: 0.75rem;">${n.created_at}</span>
            </div>
          </div>
          ${!n.is_read ? `
            <button class="btn btn-sm btn-link text-warning p-0" onclick="markNotifRead(${n.id})">
              Mark Read
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
}

async function markNotifRead(id) {
  try {
    await API.markNotificationRead(id);
    loadNotifications();
  } catch (e) {
    console.error(e);
  }
}

async function loadProfile() {
  if (!clientData) return;
  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const tempInput = document.getElementById('profile-temp');
  const notesInput = document.getElementById('profile-health');

  if (nameInput) nameInput.value = clientData.full_name || '';
  if (emailInput) emailInput.value = clientData.email || '';
  if (phoneInput) phoneInput.value = clientData.phone || '';
  if (tempInput) tempInput.value = clientData.preferred_temp || 'Medium (55°C)';
  if (notesInput) notesInput.value = clientData.health_notes || '';
}

function setupEventListeners() {
  // Goal update form
  const goalForm = document.getElementById('wellness-goals-form');
  if (goalForm) {
    goalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetInput = document.getElementById('goal-target-sessions');
      const goalTextInput = document.getElementById('goal-text');
      const focusSelect = document.getElementById('goal-focus-area');
      const notesInput = document.getElementById('goal-notes');

      try {
        await API.updateWellnessGoals({
          target_sessions_per_month: parseInt(targetInput.value) || 8,
          goal_text: goalTextInput.value.trim(),
          focus_area: focusSelect.value,
          notes: notesInput.value.trim()
        });
        Toast.success("Wellness goals successfully updated!");
        loadWellnessGoals();
      } catch (err) {
        Toast.error(err.message || "Could not save wellness goals.");
      }
    });
  }

  // Profile update form
  const profileForm = document.getElementById('profile-update-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-name').value.trim();
      const phone = document.getElementById('profile-phone').value.trim();
      const preferredTemp = document.getElementById('profile-temp').value;
      const healthNotes = document.getElementById('profile-health').value.trim();

      if (phone && !/^\d{7,15}$/.test(phone)) {
        Toast.error("Phone number must contain numbers only (7-15 digits).");
        return;
      }

      try {
        await API.updateProfile({
          full_name: name,
          phone: phone,
          preferred_temp: preferredTemp,
          health_notes: healthNotes
        });
        Toast.success("Profile details saved successfully.");
        // Refresh local cache
        clientData.full_name = name;
        clientData.phone = phone;
        document.querySelectorAll('.client-name-display').forEach(el => el.textContent = name);
      } catch (err) {
        Toast.error(err.message || "Failed to update profile.");
      }
    });
  }

  // Mark all notifications read
  const markAllBtn = document.getElementById('mark-all-read-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      try {
        await API.markAllNotificationsRead();
        Toast.success("All notifications marked as read.");
        loadNotifications();
      } catch (e) {
        Toast.error("Failed to update notifications.");
      }
    });
  }
}

// Reschedule Appointment Action
function openRescheduleModal(bookingId, currentDate, currentTime, serviceTitle) {
  currentRescheduleId = bookingId;
  let modalEl = document.getElementById('rescheduleModal');
  if (!modalEl) {
    const modalHtml = `
      <div class="modal fade" id="rescheduleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title font-serif fw-bold">Reschedule Appointment</h5>
              <button type="button" class="btn-close" data-bs-toggle="modal"></button>
            </div>
            <div class="modal-body p-4">
              <p class="text-muted small mb-3" id="reschedule-modal-subtitle">Select your new date and time.</p>
              <div class="mb-3">
                <label class="form-label small fw-bold">New Date</label>
                <input type="date" class="form-control" id="reschedule-date-input">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">New Time Slot</label>
                <div class="slot-grid" id="reschedule-slots-grid" style="grid-template-columns: repeat(2, 1fr);">
                  <!-- Loaded dynamically -->
                </div>
              </div>
              <div class="d-grid mt-4">
                <button type="button" class="btn btn-aura-primary" id="confirm-reschedule-btn" disabled>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modalEl = document.getElementById('rescheduleModal');
  }

  document.getElementById('reschedule-modal-subtitle').textContent = `Currently scheduled for ${currentDate} at ${currentTime} (${serviceTitle}).`;

  const dateInput = document.getElementById('reschedule-date-input');
  const todayStr = new Date().toISOString().split('T')[0];
  dateInput.min = todayStr;
  dateInput.value = currentDate >= todayStr ? currentDate : todayStr;

  let chosenSlot = '';
  const confirmBtn = document.getElementById('confirm-reschedule-btn');

  async function loadRescheduleSlots() {
    const grid = document.getElementById('reschedule-slots-grid');
    grid.innerHTML = `<div class="text-muted small py-2">Checking availability...</div>`;
    chosenSlot = '';
    confirmBtn.disabled = true;

    try {
      const data = await API.getAvailability(dateInput.value, 1);
      grid.innerHTML = data.slots.map(s => `
        <button type="button" class="time-slot-btn py-2 ${!s.available ? 'disabled' : ''}" data-slot="${s.time}" ${!s.available ? 'disabled' : ''}>
          <span>${s.time}</span>
          <span class="slot-status-pill">${s.available ? 'Open' : s.reason}</span>
        </button>
      `).join('');

      grid.querySelectorAll('.time-slot-btn:not(:disabled)').forEach(b => {
        b.addEventListener('click', () => {
          grid.querySelectorAll('.time-slot-btn').forEach(btn => btn.classList.remove('selected'));
          b.classList.add('selected');
          chosenSlot = b.dataset.slot;
          confirmBtn.disabled = false;
        });
      });
    } catch (err) {
      grid.innerHTML = `<div class="text-danger small py-2">Could not load slots.</div>`;
    }
  }

  dateInput.onchange = loadRescheduleSlots;
  loadRescheduleSlots();

  confirmBtn.onclick = async () => {
    if (!chosenSlot) return;
    try {
      await API.rescheduleBooking(currentRescheduleId, dateInput.value, chosenSlot);
      Toast.success("Appointment rescheduled successfully!");
      const bsModal = bootstrap.Modal.getInstance(modalEl);
      if (bsModal) bsModal.hide();
      loadBookings();
    } catch (err) {
      Toast.error(err.message || "Failed to reschedule.");
    }
  };

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}

async function confirmCancelBooking(bookingId) {
  if (confirm("Are you sure you want to cancel this appointment? If you booked using a membership session credit, it will be automatically returned to your account.")) {
    try {
      await API.cancelBooking(bookingId);
      Toast.success("Appointment cancelled.");
      await loadDashboardData();
    } catch (err) {
      Toast.error(err.message || "Could not cancel booking.");
    }
  }
}
