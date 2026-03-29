export const AMENITIES = {
  Standard: [
    { label: 'Air Conditioning', short: 'AC', icon: 'ac' },
    { label: 'Double Bed', short: 'Double Bed', icon: 'bed' },
    { label: 'Free WiFi', short: 'WiFi', icon: 'wifi' },
  ],
  Deluxe: [
    { label: 'Air Conditioning', short: 'AC', icon: 'ac' },
    { label: 'Kitchenette', short: 'Kitchen', icon: 'kitchen' },
    { label: 'King Bed', short: 'King Bed', icon: 'bed' },
    { label: 'Free WiFi', short: 'WiFi', icon: 'wifi' },
  ],
  Suite: [
    { label: 'Air Conditioning', short: 'AC', icon: 'ac' },
    { label: 'Full Kitchen', short: 'Kitchen', icon: 'kitchen' },
    { label: 'King Bed', short: 'King Bed', icon: 'bed' },
    { label: 'Lounge Area', short: 'Lounge', icon: 'lounge' },
    { label: 'Free WiFi', short: 'WiFi', icon: 'wifi' },
    { label: 'Bathtub', short: 'Bathtub', icon: 'bath' },
  ],
};

export const AMENITY_ICONS = {
  /* Snowflake — universal AC symbol */
  ac: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <polyline points="20,16 16,12 20,8"/>
      <polyline points="4,8 8,12 4,16"/>
      <polyline points="16,4 12,8 8,4"/>
      <polyline points="8,20 12,16 16,20"/>
    </svg>
  ),
  bed: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M2 8h20v12M2 12h20M22 4v4"/>
    </svg>
  ),
  wifi: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
    </svg>
  ),
  kitchen: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2v20M6 12h12M18 2v4a4 4 0 0 1-4 4h-2"/>
    </svg>
  ),
  lounge: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/>
    </svg>
  ),
  bath: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="3" y1="21" x2="21" y2="21"/><rect x="10" y="12" width="8" height="5" rx="1"/>
    </svg>
  ),
};

export const ROOM_DESCRIPTIONS = {
  Standard: 'A well-appointed standard room with all the essentials for a comfortable stay. Clean, cozy, and perfectly suited for solo travelers or couples.',
  Deluxe: 'Elevated comfort with a kitchenette and a plush king-sized bed. Ideal for guests who want a bit more space and home-like convenience during their stay.',
  Suite: 'Our premium suite offers the ultimate JCL experience — a full kitchen, luxurious king bed, spacious lounge, and a deep soaking bathtub for total relaxation.',
};
