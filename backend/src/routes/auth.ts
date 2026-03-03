import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/login', async (request, reply) => {
        const loginSchema = z.object({
            username: z.string(),
            password: z.string(),
        });

        const result = loginSchema.safeParse(request.body);
        if (!result.success) {
            return reply.code(400).send({ error: 'Invalid input' });
        }

        const { username, password } = result.data;

        if (username === 'admin' && password === 'admin123') {
            reply.setCookie('session', 'authenticated', {
                path: '/',
                httpOnly: true,
                // secure: true, // Should be true in production
                sameSite: 'lax',
            });
            return { success: true };
        } else {
            return reply.code(401).send({ error: 'Credenciales inválidas' });
        }
    });

    fastify.post('/logout', async (request, reply) => {
        reply.clearCookie('session');
        return { success: true };
    });

    fastify.get('/me', async (request, reply) => {
        if (request.cookies.session === 'authenticated') {
            return { authenticated: true, user: 'admin' };
        }
        return reply.code(401).send({ authenticated: false });
    });
}
