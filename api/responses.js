const ADMIN_KEY = process.env.ADMIN_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function isAdmin(request) {
  return Boolean(ADMIN_KEY && request.headers['x-admin-key'] === ADMIN_KEY);
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export default async function handler(request, response) {
  if (!configured()) {
    return response.status(503).json({ error: 'La base de datos no está configurada.' });
  }

  try {
    if (request.method === 'GET') {
      if (!isAdmin(request)) return response.status(401).json({ error: 'No autorizado.' });
      const rows = await supabaseRequest('responses?select=*&order=updated_at.desc');
      return response.status(200).json(rows);
    }

    if (request.method === 'POST') {
      const body = request.body || {};
      if (!body.cedula) return response.status(400).json({ error: 'La cédula es obligatoria.' });
      const rows = await supabaseRequest('responses?on_conflict=cedula', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          cedula: String(body.cedula),
          name: body.name || null,
          date: body.date || null,
          plan: body.plan || null,
          plan_label: body.planLabel || null,
          status: body.status || 'consulted',
        }),
      });
      return response.status(200).json(rows?.[0] || null);
    }

    if (request.method === 'DELETE') {
      if (!isAdmin(request)) return response.status(401).json({ error: 'No autorizado.' });
      await supabaseRequest('responses?id=not.is.null', { method: 'DELETE' });
      return response.status(204).end();
    }

    response.setHeader('Allow', 'GET, POST, DELETE');
    return response.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Error del servidor.' });
  }
}
