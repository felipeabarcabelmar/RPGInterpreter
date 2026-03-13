import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import formbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import multipart from '@fastify/multipart';
import path from 'path';

import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import fileRoutes from './routes/files.js';
import categoryRoutes from './routes/categories.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true
});

export const prisma = new PrismaClient();

// Register plugins
fastify.register(cors, {
    origin: (origin, cb) => {
        // En producción permitimos cualquier origen que sea parte de tu dominio
        if (!origin || origin.includes('traefik.me') || origin.includes('localhost')) {
            cb(null, true);
            return;
        }
        cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
fastify.register(cookie);
fastify.register(formbody);
fastify.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Serve uploads as static
fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../uploads'),
    prefix: '/uploads/',
    decorateReply: false
});


// Auth middleware (simplified)
fastify.addHook('preHandler', async (request, reply) => {
    const isPublicRoute = ['/api/auth/login', '/api/auth/logout'].includes(request.url);
    if (!isPublicRoute && !request.cookies.session) {
        // In a real decoupled app, we might return 401
        // For now, we'll allow routes but you'd protect sensitive ones
    }
});

import ticketRoutes from './routes/tickets.js';

// ... (inside the register routes section)
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(fileRoutes, { prefix: '/api/files' });
fastify.register(categoryRoutes, { prefix: '/api/categories' });
fastify.register(chatRoutes, { prefix: '/api/chat' });
fastify.register(ticketRoutes, { prefix: '/api/tickets' });

// Health check route
fastify.get('/health', async () => {
    return { status: 'ok', service: 'rpg-interpreter-backend', timestamp: new Date().toISOString() };
});


export default async (req: any, res: any) => {
    await fastify.ready();
    fastify.server.emit('request', req, res);
};

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const start = async () => {
        try {
            const port = parseInt(process.env.PORT || '3001');
            await fastify.listen({ port, host: '0.0.0.0' });
            console.log(`Server listening on http://localhost:${port}`);
        } catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    };
    start();
}

export { fastify };
