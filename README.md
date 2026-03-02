# RPG Interpreter - Caleb Group

Este sistema permite cargar archivos fuente RPG de AS/400 para obtener documentación técnica, análisis de lógica de negocio y diagramas de flujo generados por IA (Gemini).

## Características

- **Login Seguro**: Acceso protegido con fondo de video y estética moderna.
- **Análisis de IA**: Integración con Google Gemini para interpretar código RPG.
- **Diagramas Dinámicos**: Generación de diagramas de flujo interactivos en HTML/SVG.
- **Gestión de Categorías**: Organiza tus archivos por proyectos o tipos.
- **Chat de Conocimiento**: Consulta dudas específicas sobre el código cargado.

## Requisitos Locales

- Python 3.9+
- Pip (para instalar dependencias)

## Instalación y Ejecución

1.  **Instalar dependencias**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Configurar variables de entorno**:
    Crea un archivo `.env` con tu API Key:
    ```env
    GEMINI_API_KEY=tu_clave_aqui
    ```
3.  **Ejecutar**:
    ```bash
    python app.py
    ```
    La aplicación estará disponible en `http://localhost:8000`.

## Credenciales por defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

## Despliegue en Google Cloud (GCP)

Este proyecto está listo para **Cloud Run**.

1.  Asegúrate de tener el video en `static/intro.mp4`.
2.  Ejecuta el despliegue:
    ```bash
    gcloud run deploy rpg-interpreter --source . --set-env-vars="GEMINI_API_KEY=tu_clave_aqui"
    ```

## Subir a GitHub

1.  Inicializa el repo: `git init`
2.  Agrega archivos: `git add .`
3.  Commit: `git commit -m "Initial commit"`
4.  Vincula y sube:
    ```bash
    git remote add origin YOUR_REPO_URL
    git push -u origin main
    ```
