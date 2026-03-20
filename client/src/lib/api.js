const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getBranches: () => request('/branches'),
  getBranch: (id) => request(`/branches/${id}`),
  getBranchRooms: (id, available) =>
    request(`/branches/${id}/rooms${available ? '?available=1' : ''}`),
  getRoom: (id) => request(`/rooms/${id}`),
  createBooking: (data) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBooking: (reference) => request(`/bookings/${reference}`),
  getBookings: () => request('/bookings'),
  adminLogin: (password) =>
    request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  toggleRoom: (id, is_available) =>
    request(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify({ is_available }) }),
  cancelBooking: (id) =>
    request(`/admin/bookings/${id}/cancel`, { method: 'PUT' }),
  initializePayment: (booking_reference, payment_type = 'full') =>
    request('/payments/initialize', { method: 'POST', body: JSON.stringify({ booking_reference, payment_type }) }),
  verifyPayment: (reference) =>
    request(`/payments/verify/${reference}`),
};
