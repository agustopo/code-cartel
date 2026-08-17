# Carteles QR — sistema de reseñas de Google

Esta es la versión real del panel que probamos antes: en vez de guardar los datos
en el navegador, usa una base de datos de verdad (Supabase), así que los códigos
y los links funcionan siempre, desde cualquier dispositivo.

Cómo funciona: cada QR impreso apunta a `tusitio.com/r/CODIGO`. Esa dirección
nunca cambia. Lo que sí podés cambiar cuando quieras es el link de Google al que
redirige, desde el panel en `/admin`.

## Lo que necesitás antes de arrancar

- Una cuenta gratis en [supabase.com](https://supabase.com)
- Una cuenta gratis en [vercel.com](https://vercel.com)
- (Más adelante) un dominio propio — no hace falta todavía para probar

## Paso 1 — Crear la base de datos en Supabase

1. Entrá a supabase.com, creá un proyecto nuevo (elegí cualquier nombre y una
   contraseña para la base — guardala, no la vas a necesitar de nuevo pero por
   las dudas).
2. Una vez creado, andá a **SQL Editor** (en el menú de la izquierda) → **New query**.
3. Abrí el archivo `supabase-schema.sql` de esta carpeta, copiá todo su
   contenido, pegalo ahí, y tocá **Run**. Esto crea las tres tablas que necesita
   el sistema.
4. Andá a **Project Settings → API**. Ahí vas a ver dos datos que necesitás
   para el paso 3:
   - **Project URL** (algo como `https://abcxyz.supabase.co`)
   - **service_role key** (en la sección "Project API keys" — es una clave
     larga, ojo que hay otra que dice "anon" que NO es esta)

## Paso 2 — Subir el proyecto a GitHub (para que Vercel lo pueda ver)

Si no usás GitHub habitualmente, es más simple de lo que parece:

1. Creá una cuenta en [github.com](https://github.com) si no tenés.
2. Creá un repositorio nuevo (botón verde "New").
3. Subí todos los archivos de esta carpeta ahí (GitHub te deja arrastrar los
   archivos directamente desde el navegador, no hace falta usar la terminal).

## Paso 3 — Publicar en Vercel

1. Entrá a vercel.com, conectá tu cuenta de GitHub.
2. **Add New → Project**, elegí el repositorio que acabás de subir.
3. Antes de tocar "Deploy", abrí la sección **Environment Variables** y cargá
   estas cinco (los valores de Supabase son los del paso 1):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL de Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | tu service_role key de Supabase |
   | `NEXT_PUBLIC_SITE_DOMAIN` | por ahora dejá la URL que te va a dar Vercel (la podés cambiar después) |
   | `ADMIN_USER` | el usuario que vos quieras para entrar al panel |
   | `ADMIN_PASSWORD` | una contraseña segura, inventada por vos |

4. Tocá **Deploy**. En un par de minutos te da una URL tipo
   `https://carteles-qr-tunombre.vercel.app`.
5. Volvé a las Environment Variables y actualizá `NEXT_PUBLIC_SITE_DOMAIN` con
   esa misma URL (sin barra al final), y volvé a hacer deploy (Vercel tiene un
   botón "Redeploy").

## Paso 4 — Probarlo

1. Entrá a `https://tu-url.vercel.app/admin` — el navegador te va a pedir
   usuario y contraseña (los que pusiste en `ADMIN_USER` / `ADMIN_PASSWORD`).
2. Generá un código, cargale un link de reseña de Google, descargá el QR.
3. Escaneá ese QR con el celular — te tiene que redirigir directo a la reseña.

## Paso 5 — Cuando tengas tu dominio propio

Comprás el dominio donde quieras (NIC.ar, Namecheap, etc.), y en Vercel:

1. Andá a tu proyecto → **Settings → Domains** → agregá tu dominio.
2. Vercel te muestra 1 o 2 registros DNS para pegar en el panel de donde
   compraste el dominio (copiar y pegar, no hay que programar nada).
3. Actualizá `NEXT_PUBLIC_SITE_DOMAIN` con tu dominio nuevo y volvé a hacer deploy.

A partir de ahí, todos los códigos que generes van a usar tu dominio.

## Notas

- El panel (`/admin`) está protegido con usuario y contraseña simples. Alcanza
  para un solo administrador (vos). Si en el futuro varias personas necesitan
  entrar con distintos permisos, se puede migrar a un login más completo.
- El costo para empezar es $0: los planes gratis de Supabase y Vercel alcanzan
  tranquilamente para cientos de carteles.
