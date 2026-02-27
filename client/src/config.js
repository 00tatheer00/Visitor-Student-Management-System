// Use relative /api so Vite proxy (dev) forwards to backend. For production without proxy, set VITE_API_URL
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
