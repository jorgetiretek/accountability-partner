# Mi Carril

MVP personal para capturar asuntos, elegir pocas prioridades activas y confiar en que el sistema traerá de vuelta lo importante.

## Alcance implementado

- Datos de demostración persistidos localmente en el navegador.
- Captura rápida a Bandeja y procesamiento progresivo.
- Próximos, Mi Carril (máximo 3), siguiente acción y recomendaciones.
- Bloqueos con revisión, historial, desbloqueo, avance y terminación.
- Proyectos con porcentaje/hitos, esperas de terceros, búsqueda, alertas y métricas.

## Ejecución

1. `npm install --cache .npm-cache`
2. `npm run dev`
3. Abre `http://localhost:5173`.

## Calidad

`npm test`, `npm run lint`, `npm run typecheck` y `npm run build`.

## Tus datos y futuras actualizaciones

Usa **RESPALDAR** para descargar todos tus asuntos e historial en un JSON versionado y portable. La política de compatibilidad y migración está en `DATA_PORTABILITY.md`: las actualizaciones deben migrar datos, no reemplazarlos ni borrarlos.

## Limitaciones conscientes

Esta primera entrega funcional usa almacenamiento local, por lo que aún no incorpora autenticación ni una base de datos relacional de servidor. No hay notificaciones externas, dictado, multiusuario organizacional ni IA. El sistema de alertas es interno y la app se diseña para extenderlos sin reescribir el núcleo.
