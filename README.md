# KI09-Frontend

KI09-Frontend — Panel administrativo (React + TypeScript + Vite) que consume una API REST en Python

Breve
---
KI09 es un panel administrativo frontend construido con React y TypeScript (Vite) pensado para gestionar productos, categorías, clientes, órdenes y ventas. Está diseñado con una separación de capas (dominio, infraestructura y presentación) para facilitar mantenimiento, pruebas y evolución.

Tecnologías (frontend)
---
- React 19
- TypeScript
- Vite (dev server & bundler)
- Tailwind CSS (estilos utilitarios)
- PostCSS / Autoprefixer
- Axios (cliente HTTP centralizado)
- React Router (navegación)
- ESLint

Backend
---
La aplicación consume una API REST desarrollada en Python. Configure la URL del backend mediante las variables de entorno descritas abajo.

Instalación
---
1. Clona el repositorio

```bash
git clone <TU-REPO-URL>
cd KI09-Frontend
```

2. Instala dependencias

```bash
npm install
```

Variables de entorno
---
Crea un archivo `.env` en la raíz del proyecto con al menos las siguientes variables:

```env
VITE_API_URL=https://tu-backend.example.com
VITE_API_TIMEOUT=5000
```

Cómo ejecutar
---
- Desarrollo (dev server con hot reload):

```bash
npm run dev
# Abre la URL que muestre Vite (p. ej. http://localhost:5173)
```

- Build de producción:

```bash
npm run build
npm run preview
```

Estructura y decisiones
---
- `src/domain` — entidades del dominio
- `src/infrastructure/api` — wrappers HTTP y mappers Api↔Domain
- `src/presentation` — componentes, páginas y layout
- `src/config/api.ts` — configuración central de la API y token

Notas y recomendaciones
---
- Asegúrate de que `VITE_API_URL` incluya el esquema (`https://...`).
- Si vas a desplegar en producción, revisa la configuración de CORS del backend Python para permitir las cabeceras que uses (Authorization, Content-Type).

Contribuciones
---
PRs bienvenidas. Abre issues para bugs o propuestas de mejora.

Licencia
---
Licencia: MIT (ajusta según prefieras)
