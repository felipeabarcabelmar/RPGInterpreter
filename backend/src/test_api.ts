import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
// Testing different models to find which one works for the user
const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp'];

async function test() {
    for (const model of models) {
        console.log(`Testing model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: "Hello" }] }]
            });
            console.log(`Success with ${model}:`, res.data.candidates[0].content.parts[0].text.substring(0, 20));
            return;
        } catch (err: any) {
            console.log(`Failed with ${model}: ${err.response?.status} - ${err.response?.statusText}`);
        }
    }
}

test();
