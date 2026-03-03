import { FastifyInstance } from 'fastify';
import { prisma } from '../index.js';
import { z } from 'zod';

export default async function categoryRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return prisma.category.findMany();
    });

    fastify.post('/', async (request, reply) => {
        const categorySchema = z.object({
            name: z.string(),
            description: z.string().optional(),
        });

        const result = categorySchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input' });
        }

        return prisma.category.create({
            data: result.data,
        });
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const categoryId = parseInt(id);

        await prisma.rPGFile.updateMany({
            where: { categoryId },
            data: { categoryId: null },
        });

        await prisma.category.delete({
            where: { id: categoryId },
        });

        return { success: true };
    });
}
