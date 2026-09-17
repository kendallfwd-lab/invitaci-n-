const API_URL = 'https://apis.gometa.org/cedulas';

export function cleanCedula(value = '') {
  return value.replace(/\D/g, '');
}

function titleCase(value = '') {
  return value
    .toLocaleLowerCase('es-CR')
    .replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-CR'));
}

function resolveFirstName(data) {
  const personResult = data?.results?.find((item) => item?.type === 'F') ?? data?.results?.[0];
  const firstFromResult = personResult?.firstname1 || personResult?.firstname?.split(' ')?.[0];
  if (firstFromResult) return titleCase(firstFromResult.trim());

  // En respuestas donde Hacienda/GoMeta entrega directamente "nombre",
  // usamos el primer término como nombre visible en la invitación.
  const fallback = data?.nombre?.trim()?.split(/\s+/)?.[0];
  return fallback ? titleCase(fallback) : '';
}

export async function lookupCedula(rawCedula) {
  const cedula = cleanCedula(rawCedula);
  if (cedula.length < 9) {
    throw new Error('Escribe una cédula válida para continuar.');
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(cedula)}`);
  if (!response.ok) {
    throw new Error('No pudimos consultar la cédula en este momento.');
  }

  const data = await response.json();
  const firstName = resolveFirstName(data);

  if (!firstName || (!data?.nombre && !data?.results?.length)) {
    throw new Error('No encontramos una persona asociada a esa cédula.');
  }

  return {
    firstName,
    isNotMoroso: String(data?.situacion?.moroso ?? '').toUpperCase() === 'NO',
    // Conservamos el dato bruto únicamente en memoria durante esta sesión.
    raw: data,
  };
}
