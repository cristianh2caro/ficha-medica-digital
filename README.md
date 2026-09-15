# Ficha Médica Digital

Proyecto académico para registrar y consultar fichas médicas ficticias en el navegador.

## Mejoras de Semana 5

- Se eliminó un bloque duplicado de reinicio del formulario en `app.js`.
- Se eliminó una función interna sin uso en `validaciones.js`.
- Se eliminó el registro duplicado del evento `blur` del RUT.
- Se incorporaron notificaciones visibles y accesibles para Guardar, Limpiar y errores del formulario.
- Se mantuvieron las validaciones, la búsqueda y el almacenamiento en `localStorage`.

## Archivos principales

- `index.html`: estructura del formulario, buscador y área de notificaciones.
- `styles.css`: diseño adaptable y estados visuales.
- `validaciones.js`: reglas de validación y obtención de datos.
- `app.js`: almacenamiento, botones, búsqueda y notificaciones.

Los datos utilizados deben ser exclusivamente ficticios.

## Ejecutar las pruebas automáticas

Se requiere Node.js. Desde la carpeta principal ejecute:

```bash
node tests/test_semana5.mjs
```

El comando ejecuta 16 casos y genera `tests/resultados_semana5.json`.
