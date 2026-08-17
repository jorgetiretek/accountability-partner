# Arquitectura — Mi Carril MVP

## Resumen

Mi Carril es un sistema personal de ejecución: captura asuntos en segundos, conserva los no prioritarios y muestra como máximo tres asuntos activos. El MVP implementa el flujo completo de captura, procesamiento, ejecución, bloqueo, desbloqueo, avance y cierre.

## Stack elegido

- **Frontend:** React 19 + TypeScript + Vite. Es rápido, responsive y mantiene la interfaz separada de la lógica.
- **Implementación entregada:** React 19 + TypeScript + Vite, con almacenamiento persistente en `localStorage` para que el flujo pueda probarse sin configurar infraestructura.
- **Siguiente incremento de producción:** API Express + Zod, SQLite/Prisma y sesión en cookie HTTP-only. El modelo de dominio y las mutaciones ya están aislados para trasladarlos a esa API.
- **Pruebas:** Vitest para reglas de negocio y API; ESLint y TypeScript para controles estáticos.

## Arquitectura

Implementación actual: `React UI → reglas de dominio → localStorage`.

Producción prevista: `React UI → API REST → servicios de dominio → Prisma → SQLite`.

Las reglas de WIP, siguiente acción, vencimiento y recomendación están centralizadas en `src/domain.ts`; las mutaciones conservan eventos de actividad inmutables. Al incorporar la API, esas mismas reglas se trasladan al servidor para no confiar en el cliente.

## Modelo de datos

- `User`, `Role` y `UserRole`: usuarios con múltiples roles.
- `Person`: contacto externo o futuro usuario.
- `Item`: entidad central para tarea, proyecto, decisión, seguimiento o idea; almacena estado, prioridad, fechas, siguiente acción y rol.
- `Blocker`: historial de bloqueos, con motivo, dependencia y fecha de revisión.
- `Milestone`: hitos de proyectos.
- `Activity`: línea de tiempo/auditoría inmutable de cambios.

`Item` se unifica para reducir complejidad de la V1; los atributos de proyecto (porcentaje e hitos) solo se usan cuando `kind = PROJECT`.

## Supuestos del MVP

1. La instancia es personal y contiene un usuario inicial (Jorge); se conserva la relación de usuario para habilitar multiusuario después.
2. El cuarto elemento iniciado se mantiene en Próximo; una futura versión podrá ofrecer el selector de pausa dentro de un diálogo.
3. Las alertas son internas (dashboard/API). Push y correo se dejan como adaptadores futuros.
4. “Eliminar” durante el procesamiento se modela como cancelación/soft delete para no perder trazabilidad.

## Escalamiento

- **Multiusuario/organización:** añadir `Organization`, membresías y permisos; todos los registros ya llevan IDs de usuario/persona y el acceso pasa por un scope organizacional.
- **Notificaciones:** un job consulta fechas de revisión, vencimientos y compromisos, después envía mediante adaptadores (email/push).
- **IA:** una capa de sugerencias asíncrona puede proponer estructura a partir de `Item`, sin cambiar las reglas deterministas ni la base de datos.
