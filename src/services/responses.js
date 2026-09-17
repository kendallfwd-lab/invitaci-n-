const STORAGE_KEY = 'amor-cedula-responses';
const ADMIN_CEDULA = '605120994';

export function isAdminCedula(value = '') {
  return value.replace(/\D/g, '') === ADMIN_CEDULA;
}

export function getResponses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const responses = stored ? JSON.parse(stored) : [];
    return Array.isArray(responses) ? responses : [];
  } catch {
    return [];
  }
}

export function saveResponse(response) {
  const nextResponse = {
    ...response,
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([nextResponse, ...getResponses()]));
  return nextResponse;
}

export function clearResponses() {
  localStorage.removeItem(STORAGE_KEY);
}
