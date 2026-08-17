# Portabilidad y continuidad de datos

La información de Mi Carril es propiedad del usuario, no de una versión concreta de la aplicación. Ninguna actualización debe requerir recapturar asuntos ni borrar el historial.

## Contrato de exportación

La aplicación exporta un archivo JSON legible, con extensión `.json`. No depende de la base de datos interna ni de un proveedor externo.

```json
{
  "format": "mi-carril-export",
  "schemaVersion": 1,
  "appVersion": "0.1.0",
  "exportedAt": "2026-08-16T12:00:00.000Z",
  "items": []
}
```

Cada `Item` conserva su ID estable, fechas, estado, siguiente acción, bloqueo, persona, avance y eventos históricos. Los IDs nunca se regeneran durante una migración.

## Reglas para futuras actualizaciones

1. **No se eliminan campos ni eventos históricos.** Un campo obsoleto se conserva en exportaciones y se marca como legado.
2. **Toda modificación del formato aumenta `schemaVersion`.** La aplicación incorpora transformaciones desde las versiones anteriores soportadas.
3. **Primero respaldo, luego migración.** Antes de una actualización de esquema se crea y descarga/exporta un respaldo automático; solo se sustituye la copia activa tras validarlo.
4. **Migraciones idempotentes.** Ejecutar una migración dos veces debe producir el mismo resultado que ejecutarla una vez.
5. **Importación validada y no destructiva.** Si el archivo no es válido, no se toca la información existente. Al importar se podrá elegir reemplazar, fusionar o previsualizar.
6. **Exportación siempre disponible.** Aun si se adopta Supabase u otra base de datos, el botón de respaldo seguirá produciendo este JSON.

## Cambio a sincronización en línea

La migración de `localStorage` a la base en línea seguirá este proceso:

1. Exportar el archivo local antes de activar la cuenta.
2. Iniciar sesión y subir el archivo al servidor.
3. Validar número de elementos, IDs y eventos importados.
4. Confirmar con el usuario antes de limpiar la copia local.

Durante una transición se conservan ambas copias. La copia local no se borra automáticamente.

## Verificación de integridad

Antes de importar o migrar se compara: total de elementos, total de eventos, IDs únicos y rango de fechas. Una discrepancia bloquea el cambio y conserva el respaldo anterior.

## Cadencia sugerida

- Respaldo manual antes de una mejora importante.
- Respaldo automático diario cuando exista la versión en línea.
- Exportación completa disponible siempre desde Configuración.
