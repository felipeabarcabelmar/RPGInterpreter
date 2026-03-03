import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface RPGAnalysis {
    documentation: string;
    business_logic: string;
    mermaid_diagram: string;
}

class AIService {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            console.warn("WARNING: GEMINI_API_KEY no configurada en .env");
        }
        // Using gemini-2.5-flash as confirmed by model listing and user snippet
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    }

    async analyzeRPG(content: string): Promise<RPGAnalysis> {
        const prompt = `
        Como un experto en sistemas AS/400 y lenguaje RPG, analiza el siguiente código fuente:
        
        --- INICIO DEL CÓDIGO RPG ---
        ${content}
        --- FIN DEL CÓDIGO RPG ---
        
        Tu tarea es extraer:
        1. Una documentación técnica clara y concisa (overview).
        2. La lógica de negocio detallada (reglas, validaciones, flujos).
        
        RESPONDE EXCLUSIVAMENTE EN FORMATO JSON con esta estructura exacta:
        {
            "documentation": "texto aqui",
            "business_logic": "texto aqui",
            "mermaid_diagram": "diagrama mermaid aqui"
        }
        
        Asegúrate de que el JSON sea válido y no incluyas bloques de código markdown fuera del JSON.
        `;

        try {
            const response = await axios.post(this.apiUrl, {
                contents: [{ parts: [{ text: prompt }] }]
            });

            const textResponse = response.data.candidates[0].content.parts[0].text.trim();

            // Clean markdown if present
            let cleaned = textResponse;
            if (cleaned.includes('{') && cleaned.includes('}')) {
                cleaned = cleaned.substring(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1);
            }

            try {
                return JSON.parse(cleaned);
            } catch (e) {
                // Aggressive cleaning
                cleaned = cleaned.replace(/```json\s*|\s*```/g, '').trim();
                return JSON.parse(cleaned);
            }
        } catch (error: any) {
            console.error("Error calling Gemini REST API:", error.message);
            return {
                documentation: "Error en el análisis de IA.",
                business_logic: `No se pudo procesar el código: ${error.message}`,
                mermaid_diagram: "graph TD\n    A[Inicio] --> B[Error]"
            };
        }
    }

    async generateHtmlDiagram(content: string, documentation: string, logic: string): Promise<string> {
        const prompt = `
        Como un experto en visualización de datos y AS/400, crea el diagrama en html tomando este flujo de referencia:
        
        --- FLUJO / LÓGICA DE NEGOCIO ---
        ${logic}
        
        --- INFORMACIÓN ADICIONAL ---
        Documentación: ${documentation}
        Código (referencia): ${content.substring(0, 1500)}
        
        REQUISITOS TÉCNICOS:
        1. Genera un diagrama de flujo visual interactivo directamente en HTML/SVG.
        2. Estética "Cyberpunk/Neon": fondo oscuro (#0d1117), bordes cian neón (#00d4ff), sombras de resplandor.
        3. Usa etiquetas HTML/SVG directas (<div>, <svg>, <rect>, <text>, etc.).
        4. Debe ser un componente único y autocontenido con estilos CSS inline.
        
        RESPONDE EXCLUSIVAMENTE CON EL CÓDIGO HTML/SVG.
        `;

        try {
            const response = await axios.post(this.apiUrl, {
                contents: [{ parts: [{ text: prompt }] }]
            });

            let htmlResponse = response.data.candidates[0].content.parts[0].text.trim();

            // Clean markdown if present
            if (htmlResponse.startsWith("```html")) {
                htmlResponse = htmlResponse.substring(7, htmlResponse.length - 3).trim();
            } else if (htmlResponse.startsWith("```")) {
                htmlResponse = htmlResponse.substring(3, htmlResponse.length - 3).trim();
            }

            return htmlResponse;
        } catch (error: any) {
            console.error("Error generating HTML diagram:", error.message);
            return `<div style='color:#ff4d4d; padding:20px;'>Error al generar diagrama: ${error.message}</div>`;
        }
    }

    async chatQuery(query: string, context: string): Promise<string> {
        const prompt = `
        Eres un experto en sistemas AS/400 y RPG. Tienes acceso al siguiente contexto que contiene código fuente y documentación de varios programas:
        
        ${context}
        
        Pregunta del usuario: "${query}"
        
        Responde de forma clara, técnica y profesional. Si la información no está en el contexto, indícalo educadamente.
        Usa formato Markdown para resaltar código si es necesario.
        `;

        try {
            const response = await axios.post(this.apiUrl, {
                contents: [{ parts: [{ text: prompt }] }]
            });

            return response.data.candidates[0].content.parts[0].text.trim();
        } catch (error: any) {
            console.error("Error in chatQuery:", error.message);
            return `Lo siento, hubo un error al procesar tu consulta: ${error.message}`;
        }
    }
}

export const aiService = new AIService();
export default aiService;
