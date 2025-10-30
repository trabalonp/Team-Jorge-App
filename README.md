# Garmin Data Repository

Este repositorio almacena mis archivos `.fit` exportados desde mi reloj Garmin y genera automáticamente versiones `.json` legibles por mi app de Thunkable.

## Estructura
- `fits/`: Archivos `.fit` originales, organizados por año.
- `converted_json/`: Archivos `.json` generados automáticamente con los datos de cada actividad.
- `.github/workflows/convert-fits.yml`: Acción automática de GitHub que convierte `.fit` a `.json`.
- `.github/scripts/convert_fit_to_json.py`: Script Python usado por la acción.

## Cómo funciona
1. Subo un archivo `.fit` a `fits/2025/`.
2. GitHub Actions ejecuta el script de conversión.
3. El archivo `.json` aparece automáticamente en `converted_json/2025/`.
4. Mi app de Thunkable accede al JSON con una URL como: