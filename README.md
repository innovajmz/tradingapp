# Trading Calendar

Calendario y panel de riesgo para tus cuentas de trading (challenge, fondeo, real, live, futuros, demo). Registrás el resultado de cada día, definís las reglas de cada cuenta (objetivo de ganancia, pérdida diaria máxima, drawdown total) y la app te avisa cuando te acercás a romperlas. Si la cuenta tiene reparto de ganancias (%), calcula cuánto te corresponde a vos.

Hecho con Next.js (App Router), Supabase (Auth + base de datos con Row Level Security) y Tailwind CSS. Cada usuario ve solo sus propias cuentas.

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. Andá a **SQL Editor** → **New query**, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea las tablas `accounts` y `entries` con seguridad a nivel de fila (cada usuario solo ve lo suyo).
3. Andá a **Authentication → Providers** y confirmá que "Email" esté habilitado. Si no querés que pida confirmación por correo mientras probás, podés desactivar "Confirm email" en **Authentication → Settings**.
4. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**

## 2. Variables de entorno locales

Creá un archivo de variables de entorno de Next.js en la raíz del proyecto (el que Next.js carga automáticamente en desarrollo, no versionado en git) con estas dos variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Te va a pedir crear una cuenta (email + contraseña) antes de ver el panel.

## 4. Subir a GitHub

```bash
git add -A
git commit -m "Trading calendar app"
git branch -M main
git remote add origin <url-de-tu-repo>
git push -u origin main
```

## 5. Deploy en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importá el repo de GitHub.
2. En **Environment Variables**, agregá las mismas dos variables del paso 2 (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Deploy. Cada push a `main` vuelve a desplegar automáticamente.

## Estructura

- `app/` — rutas de Next.js (`/login`, `/` panel principal)
- `components/` — UI del panel (sidebar, calendario, modales, gráfico de equity)
- `lib/metrics.js` — cálculo de balance, drawdown, pérdida diaria y progreso hacia la meta
- `lib/supabase/` — clientes de Supabase (browser y server)
- `middleware.js` — protege las rutas y refresca la sesión
- `supabase/schema.sql` — tablas y políticas de seguridad para correr en Supabase
