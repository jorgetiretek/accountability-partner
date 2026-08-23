# Activación de Supabase

## Base de datos

El archivo `supabase/schema.sql` crea las tablas y políticas de seguridad. Se ejecutó en el proyecto `mi-carril` el 18 de agosto de 2026.

## Variables de publicación

En GitHub, dentro del repositorio, añadir:

- Variable `VITE_SUPABASE_URL`: la URL del proyecto Supabase.
- Secret `VITE_SUPABASE_PUBLISHABLE_KEY`: la clave pública/publishable de la sección API Keys.

El segundo valor es una clave de cliente y se incluye en el navegador; la seguridad de datos depende de las políticas RLS de la base de datos. Nunca agregar la clave `service_role` a GitHub Pages ni al frontend.

## Enlaces de acceso

En Supabase > Authentication > URL Configuration:

- Site URL: `https://jorgetiretek.github.io/accountability-partner/`
- Redirect URL adicional: `https://jorgetiretek.github.io/accountability-partner/`

La app utiliza enlaces de acceso enviados por correo. Solo después de autenticarse se sincronizan los pendientes.
