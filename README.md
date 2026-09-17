Para revisar las respuestas guardadas en ese mismo navegador, abre el panel directamente o escribe la cédula administradora `605120994` en la pantalla inicial:
# Amor React + GoMeta 💗

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

La cédula validada, el nombre, la fecha y el plan se guardan progresivamente en `localStorage` del navegador. Para revisar las respuestas guardadas en ese mismo navegador, escribe la clave administradora `605120994ksv` en la pantalla inicial o abre:

```text
http://localhost:5173/?admin=1
```

El panel permite exportar los registros como JSON y borrar todos los datos. Esta implementación es local: no comparte respuestas entre dispositivos ni reemplaza una base de datos para producción.

## API

GoMeta documenta un límite anónimo de 20 consultas por IP cada 5 minutos. Para un uso mayor, revisa su opción de API key.
