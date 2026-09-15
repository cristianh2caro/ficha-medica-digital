# Evidencia de pruebas Semana 5

## Resultado general

Se ejecutaron 16 casos sobre la versión original y se repitieron después de las mejoras. El resultado fue 16 casos aprobados, 0 fallidos, tanto en la línea base como en la regresión.

## Cambios sometidos a regresión

1. Eliminación del bloque duplicado de reinicio en `app.js`.
2. Eliminación de una función interna sin uso en `validaciones.js`.
3. Eliminación del evento `blur` duplicado del RUT.
4. Incorporación de notificaciones visibles y accesibles en `index.html`, `styles.css` y `app.js`.

## Casos ejecutados

| Código | Tipo | Proceso comprobado | Resultado |
| --- | --- | --- | --- |
| CN-01 | Caja negra | Carga de 10 campos y botones principales | Aprobado |
| CN-02 | Caja negra | Guardar formulario vacío | Aprobado |
| CN-03 | Caja negra | Guardar registro válido y notificación | Aprobado |
| CN-04 | Caja negra | Rechazar RUT inválido | Aprobado |
| CN-05 | Caja negra | Limpiar con confirmación | Aprobado |
| CN-06 | Caja negra | Cerrar, cancelar y reabrir | Aprobado |
| CN-07 | Caja negra | Buscar sin distinguir tildes o mayúsculas | Aprobado |
| CN-08 | Caja negra | Buscar apellido inexistente | Aprobado |
| CN-09 | Caja negra | Rechazar fecha futura y edad mayor de 120 años | Aprobado |
| CN-10 | Caja negra | Rechazar correo y teléfono incorrectos | Aprobado |
| CB-01 | Caja blanca | Ramas del algoritmo de RUT | Aprobado |
| CB-02 | Caja blanca | Retornos verdadero y falso de validación integral | Aprobado |
| CB-03 | Caja blanca | Alta, cancelar sobrescritura y aceptar sobrescritura | Aprobado |
| CB-04 | Caja blanca | Normalización, escape HTML y longitud de búsqueda | Aprobado |
| INT-01 | Integración | Formulario, validación, almacenamiento y búsqueda | Aprobado |
| REG-01 | Regresión | Guardar, Limpiar, Cerrar, Reabrir y Buscar | Aprobado |

## Alcance

Las pruebas automáticas se ejecutaron con datos ficticios en un entorno controlado que simula el DOM y `localStorage`. La validación visual de la versión publicada debe repetirse después de subir estos archivos a GitHub Pages, porque la dirección pública continúa mostrando la versión anterior mientras no se publique el nuevo código.
