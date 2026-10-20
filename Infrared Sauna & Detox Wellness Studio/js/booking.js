/**
 * AURA & SOLACE - Booking Engine
 * Real-time slot availability, validation, membership detection, confirmation modal
 */

let selectedServiceId = 1;
let selectedDate = '';
let selectedSlot = '';
let servicesList = [];
let currentUser = null;
let currentMembership = null;

document.addEventListener('DOMContentLoaded', async () => {
  initBookingDefaults();
  await loadServicesAndUser();
  setupEventListeners();
  loadAvailabilityForDate();
});

function initBookingDefaults() {
  // Set default date to today (or tomorrow if late evening)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const defaultDateStr = `${year}-${month}-${day}`;

  const dateInput = document.getElementById('booking-date-input');
  if (dateInput) {
    dateInput.min = defaultDateStr;
    dateInput.value = defaultDateStr;
    selectedDate = defaultDateStr;
  }

  // Check URL query parameters for preselected service
  const params = new URLSearchParams(window.location.search);
  const serviceParam = params.get('service');
  if (serviceParam) {
    selectedServiceId = parseInt(serviceParam) || 1;
  }
}

async function loadServicesAndUser() {
  try {
    // 1. Fetch available services
    const servicesData = await API.getServices();
    if (servicesData && servicesData.services) {
      servicesList = servicesData.services;
      renderServiceCards(servicesList);
    }

    // 2. Fetch logged in user & membership details
    const authData = await API.getMe();
    if (authData && authData.authenticated && authData.user) {
      currentUser = authData.user;
      currentMembership = authData.membership;
      populateClientFields(currentUser, currentMembership);
    }
  } catch (err) {
    console.error("Error loading booking dependencies:", err);
  }
}

function renderServiceCards(services) {
  const container = document.getElementById('booking-services-container');
  if (!container) return;

  container.innerHTML = services.map(srv => {
    const isSelected = srv.id === selectedServiceId;
    return `
      <div class="col-md-6 col-lg-3 mb-3">
        <div class="service-select-card card h-100 p-3 border-2 ${isSelected ? 'border-warning shadow-sm bg-amber-subtle' : 'border-light-subtle'}" 
             data-service-id="${srv.id}" style="cursor: pointer; border-radius: 14px; transition: all 0.2s ease;">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge ${isSelected ? 'bg-warning text-dark' : 'bg-light text-muted'}" style="font-size: 0.72rem;">
              ${srv.duration_min} MIN
            </span>
            <span class="ms-auto fw-bold text-dark fs-5">$${srv.price.toFixed(2)}</span>
          </div>
          <h6 class="fw-bold mb-1 text-dark">${srv.title}</h6>
          <p class="small text-muted mb-0" style="font-size: 0.82rem; line-height: 1.4;">${srv.subtitle || srv.category}</p>
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to select service
  container.querySelectorAll('.service-select-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedServiceId = parseInt(card.dataset.serviceId);
      renderServiceCards(servicesList);
      updateBookingSummary();
      loadAvailabilityForDate();
    });
  });

  updateBookingSummary();
}

function populateClientFields(user, membership) {
  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const phoneInput = document.getElementById('client-phone');
  const membershipNotice = document.getElementById('membership-benefit-alert');

  if (nameInput) nameInput.value = user.full_name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput && user.phone) phoneInput.value = user.phone;

  if (membership && membership.status === 'active' && membership.sessions_used < membership.session_limit) {
    if (membershipNotice) {
      const remaining = membership.session_limit - membership.sessions_used;
      membershipNotice.classList.remove('d-none');
      membershipNotice.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-patch-check-fill text-success fs-5"></i>
          <div>
            <strong>Active Membership Applied: ${membership.plan_name}</strong>
            <div class="small text-muted">This session will use 1 of your ${remaining} remaining sessions (Session cost: $0.00).</div>
          </div>
        </div>
      `;
    }
  }
}

function setupEventListeners() {
  const dateInput = document.getElementById('booking-date-input');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      selectedSlot = '';
      updateBookingSummary();
      loadAvailabilityForDate();
    });
  }

  const bookingForm = document.getElementById('appointment-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
}

async function loadAvailabilityForDate() {
  const slotsContainer = document.getElementById('time-slots-container');
  const loadingIndicator = document.getElementById('slots-loading');
  if (!slotsContainer || !selectedDate) return;

  if (loadingIndicator) loadingIndicator.classList.remove('d-none');
  slotsContainer.innerHTML = '';

  try {
    const data = await API.getAvailability(selectedDate, selectedServiceId);
    if (loadingIndicator) loadingIndicator.classList.add('d-none');

    if (!data.slots || data.slots.length === 0) {
      slotsContainer.innerHTML = `<div class="col-12 text-center text-muted py-4">No slots available on this date. Please select another date.</div>`;
      return;
    }

    slotsContainer.innerHTML = data.slots.map(slot => {
      const isSelected = slot.time === selectedSlot;
      const isAvailable = slot.available;

      return `
        <button type="button" 
                class="time-slot-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}" 
                data-slot="${slot.time}" 
                ${!isAvailable ? 'disabled' : ''}>
          <span>${slot.time}</span>
          <span class="slot-status-pill">${isAvailable ? 'Available' : slot.reason}</span>
        </button>
      `;
    }).join('');

    // Slot click handler
    slotsContainer.querySelectorAll('.time-slot-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        slotsContainer.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSlot = btn.dataset.slot;
        updateBookingSummary();
      });
    });

  } catch (err) {
    if (loadingIndicator) loadingIndicator.classList.add('d-none');
    slotsContainer.innerHTML = `<div class="col-12 text-danger text-center py-4">Failed to load time slots. Please refresh or try again.</div>`;
    Toast.error(err.message || "Failed to fetch availability.");
  }
}

function updateBookingSummary() {
  const service = servicesList.find(s => s.id === selectedServiceId);
  const summaryServiceEl = document.getElementById('summary-service-name');
  const summaryDurationEl = document.getElementById('summary-duration');
  const summaryDateEl = document.getElementById('summary-date');
  const summaryTimeEl = document.getElementById('summary-time');
  const summaryPriceEl = document.getElementById('summary-price');

  if (service) {
    if (summaryServiceEl) summaryServiceEl.textContent = service.title;
    if (summaryDurationEl) summaryDurationEl.textContent = `${service.duration_min} minutes`;
    
    // Calculate price (free if active membership has credits)
    let displayPrice = `$${service.price.toFixed(2)}`;
    if (currentMembership && currentMembership.status === 'active' && currentMembership.sessions_used < currentMembership.session_limit) {
      displayPrice = `$0.00 (Membership)`;
    }
    if (summaryPriceEl) summaryPriceEl.textContent = displayPrice;
  }

  if (summaryDateEl) {
    if (selectedDate) {
      const dt = new Date(selectedDate + 'T00:00:00');
      summaryDateEl.textContent = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      summaryDateEl.textContent = 'Please choose date';
    }
  }

  if (summaryTimeEl) {
    summaryTimeEl.textContent = selectedSlot || 'Please choose time';
  }
}

async function handleBookingSubmit(e) {
  e.preventDefault();

  if (!selectedDate) {
    Toast.warning("Please choose your preferred appointment date.");
    return;
  }

  if (!selectedSlot) {
    Toast.warning("Please select an available time slot.");
    return;
  }

  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const phoneInput = document.getElementById('client-phone');
  const notesInput = document.getElementById('client-notes');
  const submitBtn = document.getElementById('submit-booking-btn');

  const clientName = nameInput ? nameInput.value.trim() : '';
  const clientEmail = emailInput ? emailInput.value.trim() : '';
  const clientPhone = phoneInput ? phoneInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!clientName || !clientEmail || !clientPhone) {
    Toast.error("Please fill in your name, email, and phone number.");
    return;
  }

  if (!/^\d{7,15}$/.test(clientPhone)) {
    Toast.error("Phone number must contain numbers only (7-15 digits).");
    return;
  }

  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Confirming Appointment...`;

  try {
    const bookingPayload = {
      service_id: selectedServiceId,
      booking_date: selectedDate,
      time_slot: selectedSlot,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      notes: notes
    };

    const res = await API.createBooking(bookingPayload);
    Toast.success("Appointment successfully confirmed!");
    showBookingConfirmationModal(res.booking);

    // Refresh slots
    loadAvailabilityForDate();
  } catch (err) {
    Toast.error(err.message || "Could not complete booking. The slot may have just been taken.");
    // Refresh slots to show real-time collision
    loadAvailabilityForDate();
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

function showBookingConfirmationModal(booking) {
  let modalEl = document.getElementById('bookingConfirmationModal');
  if (!modalEl) {
    const modalHtml = `
      <div class="modal fade" id="bookingConfirmationModal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <div class="modal-header bg-dark text-white border-0 py-3">
              <h5 class="modal-title font-serif" id="modalLabel">
                <i class="bi bi-check-circle-fill text-warning me-2"></i>Booking Confirmed!
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-toggle="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 text-center">
              <div class="badge bg-warning text-dark fs-6 py-2 px-3 mb-3 font-accent" id="modal-booking-code">
                CODE
              </div>
              <h4 class="fw-bold mb-1 text-dark" id="modal-service-name">Service</h4>
              <p class="text-muted small mb-4" id="modal-datetime">Date & Time</p>
              
              <div class="bg-light p-3 rounded-3 text-start small mb-4 border">
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Client:</span>
                  <strong id="modal-client-name">-</strong>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Duration:</span>
                  <span id="modal-duration">-</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted">Amount:</span>
                  <strong class="text-success" id="modal-price">-</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Studio Suite:</span>
                  <span>Canadian Cedar Suite #3</span>
                </div>
              </div>

              <div class="alert alert-warning text-start small py-2 mb-4">
                <i class="bi bi-info-circle me-1"></i>
                <span id="modal-prep-text">Please arrive 10 minutes prior to your session for hydration and gowning.</span>
              </div>

              <div class="d-grid gap-2">
                <a href="dashboard.html" class="btn btn-aura-primary">
                  <i class="bi bi-speedometer2 me-1"></i> View in Client Dashboard
                </a>
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  Book Another Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modalEl = document.getElementById('bookingConfirmationModal');
  }

  // Populate modal data
  document.getElementById('modal-booking-code').textContent = `BOOKING REF: ${booking.booking_code}`;
  document.getElementById('modal-service-name').textContent = booking.service_title;
  document.getElementById('modal-datetime').textContent = `${booking.booking_date} at ${booking.time_slot}`;
  document.getElementById('modal-client-name').textContent = booking.client_name;
  document.getElementById('modal-duration').textContent = `${booking.duration_min} minutes`;
  document.getElementById('modal-price').textContent = booking.price > 0 ? `$${booking.price.toFixed(2)}` : 'Covered by Membership';
  if (booking.preparation_instructions) {
    document.getElementById('modal-prep-text').textContent = booking.preparation_instructions;
  }

  const bsModal = new bootstrap.Modal(modalEl);
  bsModal.show();
}
