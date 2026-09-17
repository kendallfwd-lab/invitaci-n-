const STORAGE_KEY = 'amor-cedula-responses';
const ADMIN_CEDULA = '605120994+-';
const API_URL = '/api/responses';

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

export async function fetchResponses() {
  const response = await fetch(API_URL, { headers: { 'x-admin-key': ADMIN_CEDULA } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || 'No se pudo conectar con la base de datos.');
  const normalized = data.map(normalizeResponse);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function normalizeResponse(response) {
  return {
    ...response,
    planLabel: response.planLabel ?? response.plan_label,
    createdAt: response.createdAt ?? response.created_at,
    updatedAt: response.updatedAt ?? response.updated_at,
  };
}

export async function saveResponse(response) {
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

  try {
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });
    if (apiResponse.ok) {
      const saved = normalizeResponse(await apiResponse.json());
      localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...responses]));
      return saved;
    }
  } catch {
    // El respaldo local permite desarrollar sin configurar la base todavía.
  }

  return nextResponse;
}

export async function clearResponses() {
  localStorage.removeItem(STORAGE_KEY);
  try {
    await fetch(API_URL, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_CEDULA } });
  } catch {
    // La limpieza local ya se completó.
  }
}
