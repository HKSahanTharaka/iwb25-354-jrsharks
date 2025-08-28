export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

export function buildApiUrl(path = '') {
  const base = API_BASE_URL.replace(/\/$/, '');
  const suffix = String(path || '').replace(/^\//, '');
  return suffix ? `${base}/${suffix}` : base;
}


