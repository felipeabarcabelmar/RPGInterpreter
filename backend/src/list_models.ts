import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function test() {
    console.log(`Testing with API Key: ${apiKey?.substring(0, 8)}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await axios.get(url);
        console.log(`Available models:`, res.data.models.map((m: any) => m.name));
    } catch (err: any) {
        console.log(`Failed to list models: ${err.response?.status} - ${err.response?.statusText}`);
        console.log(`Error data:`, err.response?.data);
    }
}

test();
