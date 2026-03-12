import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../index.js';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';

const ticketRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // List all tickets
    fastify.get('/', async (request, reply) => {
        try {
            const tickets = await prisma.ticket.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return tickets;
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch tickets' });
        }
    });

    // Create a new ticket
    fastify.post('/', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'No file or data provided' });
            }

            // In Fastify multipart, non-file fields are in data.fields
            const title = (data.fields.title as any)?.value;
            const description = (data.fields.description as any)?.value;

            if (!title || !description) {
                return reply.status(400).send({ error: 'Title and description are required' });
            }

            let attachmentUrl = null;
            if (data.file && data.filename) {
                const uploadDir = path.join(process.cwd(), 'uploads/tickets');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `${Date.now()}-${data.filename}`;
                const savePath = path.join(uploadDir, filename);
                await pipeline(data.file, fs.createWriteStream(savePath));
                attachmentUrl = `/uploads/tickets/${filename}`;
            }

            const ticket = await prisma.ticket.create({
                data: {
                    title,
                    description,
                    status: 'Abierto',
                    attachmentUrl
                }
            });
            return ticket;
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to create ticket' });
        }
    });

    // Update ticket (Backoffice)
    fastify.patch('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const schema = z.object({
            title: z.string().min(1).optional(),
            description: z.string().min(1).optional(),
            status: z.enum(['Abierto', 'En Proceso', 'Resuelto', 'Cerrado']).optional(),
            criticality: z.enum(['Baja', 'Media', 'Alta', 'Crítica']).optional(),
            solution: z.string().optional()
        });

        try {
            const updateData = schema.parse(request.body);
            const ticket = await prisma.ticket.update({
                where: { id: parseInt(id) },
                data: updateData
            });
            return ticket;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: error.errors });
            }
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update ticket' });
        }
    });

    // Delete ticket (Backoffice)
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            await prisma.ticket.delete({
                where: { id: parseInt(id) }
            });
            return { message: 'Ticket deleted successfully' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete ticket' });
        }
    });
};

export default ticketRoutes;
