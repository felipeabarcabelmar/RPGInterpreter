import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY no configurada en el archivo .env")
        # Usamos la API de Gemini vía REST para evitar problemas de dependencias de la librería oficial
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"

    def analyze_rpg(self, content: str):
        """
        Interpreta código RPG usando la REST API de Gemini y extrae documentación, lógica y diagramas.
        """
        prompt = f"""
        Como un experto en sistemas AS/400 y lenguaje RPG, analiza el siguiente código fuente:
        
        --- INICIO DEL CÓDIGO RPG ---
        {content}
        --- FIN DEL CÓDIGO RPG ---
        
        Tu tarea es extraer:
        1. Una documentación técnica clara y concisa (overview).
        2. La lógica de negocio detallada (reglas, validaciones, flujos).
        
        RESPONDE EXCLUSIVAMENTE EN FORMATO JSON con esta estructura exacta:
        {{
            "documentation": "texto aqui",
            "business_logic": "texto aqui",
            "mermaid_diagram": "diagrama mermaid aqui"
        }}
        
        Asegúrate de que el JSON sea válido y no incluyas bloques de código markdown fuera del JSON.
        """
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Extraer el texto de la respuesta de Gemini
            text_response = data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Limpiar si el modelo devuelve markdown
            import re
            # Buscamos el primer { y el último } para extraer el JSON
            if "{" in text_response and "}" in text_response:
                text_response = text_response[text_response.find("{"):text_response.rfind("}")+1]
                
            try:
                result = json.loads(text_response)
            except json.JSONDecodeError:
                # Si falló, intentamos limpiar más agresivamente
                text_response = re.sub(r'```json\s*|\s*```', '', text_response).strip()
                result = json.loads(text_response)
            
            # Ensure all keys exist
            if "mermaid_diagram" not in result:
                result["mermaid_diagram"] = "graph TD\n    A[Inicio] --> B[Fin]"
            
            return result
        except Exception as e:
            print(f"Error calling Gemini REST API: {e}")
            return {
                "documentation": "Error en el análisis de IA.",
                "business_logic": f"No se pudo procesar el código: {str(e)}"
            }

    def generate_html_diagram(self, content: str, documentation: str, logic: str):
        """
        Genera un diagrama HTML/SVG basado en el contenido y análisis previo.
        """
        prompt = f"""
        Como un experto en visualización de datos y AS/400, crea el diagrama en html tomando este flujo de referencia:
        
        --- FLUJO / LÓGICA DE NEGOCIO ---
        {logic}
        
        --- INFORMACIÓN ADICIONAL ---
        Documentación: {documentation}
        Código (referencia): {content[:1500]}
        
        REQUISITOS TÉCNICOS:
        1. Genera un diagrama de flujo visual interactivo directamente en HTML/SVG.
        2. Estética "Cyberpunk/Neon": fondo oscuro (#0d1117), bordes cian neón (#00d4ff), sombras de resplandor.
        3. Usa etiquetas HTML/SVG directas (<div>, <svg>, <rect>, <text>, etc.).
        4. Debe ser un componente único y autocontenido con estilos CSS inline.
        
        RESPONDE EXCLUSIVAMENTE CON EL CÓDIGO HTML/SVG.
        """
        
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            html_response = data['candidates'][0]['content']['parts'][0]['text'].strip()
            
            # Limpiar markdown si existe
            if html_response.startswith("```html"):
                html_response = html_response[7:-3].strip()
            elif html_response.startswith("```"):
                html_response = html_response[3:-3].strip()
                
            return html_response
        except Exception as e:
            print(f"Error generating HTML diagram: {e}")
            return f"<div style='color:#ff4d4d; padding:20px;'>Error al generar diagrama: {str(e)}</div>"

    def chat_query(self, query: str, context: str):
        """
        Responde consultas sobre el código subido (Contexto).
        """
        prompt = f"""
        Eres un experto en sistemas AS/400 y RPG. Tienes acceso al siguiente contexto que contiene código fuente y documentación de varios programas:
        
        {context}
        
        Pregunta del usuario: "{query}"
        
        Responde de forma clara, técnica y profesional. Si la información no está en el contexto, indícalo educadamente.
        Usa formato Markdown para resaltar código si es necesario.
        """
        
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data['candidates'][0]['content']['parts'][0]['text'].strip()
        except Exception as e:
            print(f"Error in chat_query: {e}")
            return f"Lo siento, hubo un error al procesar tu consulta: {str(e)}"

# Instancia singleton para uso en app.py
ai_service_instance = AIService()
