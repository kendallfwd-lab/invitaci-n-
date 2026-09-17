const STORAGE_KEY = 'amor-cedula-responses';
const ADMIN_CEDULA = '605120994ksv';

export function isAdminCedula(value = '') {
  return value.trim().toLowerCase() === ADMIN_CEDULA;
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
  const responses = getResponses();
  const existingIndex = responses.findIndex((item) => item.cedula === response.cedula);
  const existing = existingIndex >= 0 ? responses[existingIndex] : null;
  const nextResponse = {
    ...existing,
    ...response,
    id: existing?.id || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) responses.splice(existingIndex, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([nextResponse, ...responses]));
  return nextResponse;
}

export function clearResponses() {
  localStorage.removeItem(STORAGE_KEY);
}
