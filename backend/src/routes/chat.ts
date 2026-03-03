import { FastifyInstance } from 'fastify';
import { prisma } from '../index.js';
import { aiService } from '../services/aiService.js';
import { z } from 'zod';

export default async function chatRoutes(fastify: FastifyInstance) {
    fastify.post('/', async (request, reply) => {
        const chatSchema = z.object({
            query: z.string(),
            filter_type: z.enum(['all', 'category', 'file']).default('all'),
            filter_id: z.number().optional(),
        });

        const result = chatSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input' });
        }

        const { query, filter_type, filter_id } = result.data;

        let files;
        if (filter_type === 'category' && filter_id) {
            files = await prisma.rPGFile.findMany({ where: { categoryId: filter_id } });
        } else if (filter_type === 'file' && filter_id) {
            files = await prisma.rPGFile.findMany({ where: { id: filter_id } });
        } else {
            files = await prisma.rPGFile.findMany();
        }

        if (!files || files.length === 0) {
            return { response: "Aún no hay archivos subidos en el sistema o el filtro no devolvió resultados." };
        }

        let context = "";
        for (const f of files) {
            context += `ARCHIVO: ${f.filename}\nDOCUMENTACION: ${f.documentation}\nLOGICA: ${f.businessLogic}\nCODIGO:\n${f.content.substring(0, 800)}\n---\n`;
        }

        if (context.length > 15000) {
            context = context.substring(0, 15000) + "\n...[Contexto truncado por longitud]...";
        }

        const response = await aiService.chatQuery(query, context);
        return { response };
    });
}
