Para revisar las respuestas guardadas en ese mismo navegador, abre el panel directamente o escribe la cédula administradora `605120994` en la pantalla inicial:
# Amor React + GoMeta

Experiencia romántica hecha con React + Vite.

## Flujo

1. La persona escribe su cédula.
2. La app consulta `https://apis.gometa.org/cedulas/{cedula}`.
3. Recupera el nombre y valida la respuesta de `situacion.moroso`.
4. Si la validación permite continuar, muestra una invitación personalizada usando el nombre.
5. Al aceptar, permite escoger fecha y tipo de plan.
6. Termina con un resumen y confeti.

> Nota: el campo `moroso` representa la situación tributaria reportada en la respuesta de Hacienda/GoMeta; no es un historial crediticio general.

## Librerías

- React
- Vite
- Framer Motion
- Lucide React
- canvas-confetti

## Ejecutar

```bash
npm install
npm run dev
```

Abre la URL que Vite muestre en la terminal (normalmente `http://localhost:5173`).

## Respuestas y administrador

La cédula validada, el nombre, la fecha y el plan se guardan progresivamente. En desarrollo, `localStorage` funciona como respaldo. En producción, la API de Vercel los guarda en Supabase para compartirlos entre dispositivos. Para revisar las respuestas, escribe la clave administradora `605120994ksv` en la pantalla inicial o abre:

```text
http://localhost:5173/?admin=1
```

El panel permite exportar los registros como JSON y borrar todos los datos.

## Desplegar gratis en Vercel + Supabase

1. Crea un proyecto gratuito en Supabase.
2. Abre el SQL Editor y ejecuta [`supabase/schema.sql`](supabase/schema.sql).
3. En Vercel, importa este repositorio como proyecto Vite.
4. Añade estas variables en Vercel, sin subirlas al repositorio:
	- `SUPABASE_URL`: URL del proyecto Supabase.
	- `SUPABASE_SERVICE_ROLE_KEY`: clave `service_role` de Supabase.
	- `ADMIN_KEY`: `605120994ksv`.
5. Despliega. Vercel detectará `api/responses.js` como función serverless.

La clave `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el servidor y nunca debe ponerse en variables `VITE_*` ni en el frontend.

## API

GoMeta documenta un límite anónimo de 20 consultas por IP cada 5 minutos. Para un uso mayor, revisa su opción de API key.
