import { FastifyInstance } from 'fastify';
import { prisma } from '../index.js';
import { aiService } from '../services/aiService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { z } from 'zod';

export default async function fileRoutes(fastify: FastifyInstance) {
    // GET /api/files - List all files
    fastify.get('/', async (request, reply) => {
        return prisma.rPGFile.findMany({
            include: {
                category: true
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });
    });

    // POST /api/files/upload - Upload file (just saves content)
    fastify.post('/upload', async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }

        const contentBuffer = await data.toBuffer();
        const content = contentBuffer.toString('utf-8');
        const filename = data.filename;

        // Get fields from multipart
        const categoryId = data.fields?.categoryId ? parseInt((data.fields.categoryId as any).value) : undefined;

        // Save to DB WITHOUT analysis
        const dbFile = await prisma.rPGFile.create({
            data: {
                filename,
                content,
                documentation: '',
                businessLogic: '',
                mermaidDiagram: '',
                categoryId: categoryId
            }
        });

        return dbFile;
    });

    // ANALYZE /api/files/:id/analyze - Trigger AI analysis
    fastify.post('/:id/analyze', async (request, reply) => {
        const { id } = request.params as { id: string };
        const file = await prisma.rPGFile.findUnique({
            where: { id: parseInt(id) }
        });

        if (!file) {
            return reply.code(404).send({ error: 'File not found' });
        }

        // Analyze with AI
        const analysis = await aiService.analyzeRPG(file.content);

        // Update DB
        const updated = await prisma.rPGFile.update({
            where: { id: parseInt(id) },
            data: {
                documentation: analysis.documentation,
                businessLogic: analysis.business_logic,
                mermaidDiagram: analysis.mermaid_diagram
            }
        });

        return updated;
    });

    // GET /api/files/:id - Get single file

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const file = await prisma.rPGFile.findUnique({
            where: { id: parseInt(id) },
            include: { category: true }
        });

        if (!file) {
            return reply.code(404).send({ error: 'File not found' });
        }

        return file;
    });

    // PATCH /api/files/:id - Update file analysis
    fastify.patch('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const editSchema = z.object({
            documentation: z.string().optional(),
            businessLogic: z.string().optional(),
            categoryId: z.number().optional().nullable(),
        });

        const result = editSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input' });
        }

        const updated = await prisma.rPGFile.update({
            where: { id: parseInt(id) },
            data: result.data
        });

        return updated;
    });

    // DELETE /api/files/:id - Delete file

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        await prisma.rPGFile.delete({
            where: { id: parseInt(id) }
        });
        return { success: true };
    });

    // POST /api/files/:id/generate-diagram - Generate HTML diagram
    fastify.post('/:id/generate-diagram', async (request, reply) => {
        const { id } = request.params as { id: string };
        const file = await prisma.rPGFile.findUnique({
            where: { id: parseInt(id) }
        });

        if (!file) {
            return reply.code(404).send({ error: 'File not found' });
        }

        if (file.htmlDiagram) {
            return { html_diagram: file.htmlDiagram, cached: true };
        }

        const htmlDiagram = await aiService.generateHtmlDiagram(
            file.content,
            file.documentation || '',
            file.businessLogic || ''
        );

        await prisma.rPGFile.update({
            where: { id: parseInt(id) },
            data: { htmlDiagram }
        });

        return { html_diagram: htmlDiagram, cached: false };
    });
}
