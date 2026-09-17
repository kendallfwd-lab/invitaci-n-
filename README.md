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

## Privacidad

La aplicación no guarda la cédula en `localStorage`, cookies ni base de datos. El valor solo se utiliza para realizar la consulta durante la sesión actual.

## API

GoMeta documenta un límite anónimo de 20 consultas por IP cada 5 minutos. Para un uso mayor, revisa su opción de API key.
