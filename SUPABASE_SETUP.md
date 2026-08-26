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

## Equipo y estructura

Para sincronizar el organigrama entre computadora y celular, ejecutar una sola vez el contenido completo de `supabase/organization.sql` en Supabase > SQL Editor. Esta configuración agrega una tabla privada por usuario para puestos, personas y asignaciones del organigrama.
