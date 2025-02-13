import dotenv from 'dotenv';
import fs from 'fs';
import Groq from 'groq-sdk';
import { AI_PROMOT } from './utils.js';

// Load environment variables
dotenv.config();
const AI_API_KEY = process.env.AI_API_KEY;

// Ensure API key is available
if (!AI_API_KEY) {
    console.error('Error: AI_API_KEY is not defined in .env file.');
    process.exit(1);
}

// Initialize Groq client
const GroqGlobal = new Groq({ apiKey: AI_API_KEY });

// Function to get AI response
async function getReply(message, client) {
    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `${AI_PROMOT} ${message}`,
                }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return 'Error: Unable to get response.';
    }
}

// Test messages
const testMessages = [
    { input: 'code for reverse string', output: '' }
];

(async () => {
    const fileStream = fs.createWriteStream('ai_responses.txt');

    for (const test of testMessages) {
        const reply = await getReply(`REAL MESSAGE: ${test.input}`, GroqGlobal);
        
        // Log raw response
        console.log('Raw AI Response:', reply);
        
        fileStream.write(`Input: ${test.input}\nOutput: ${reply}\n\n`);

        try {
            const replyDict = JSON.parse(reply);
            console.log('Parsed JSON:', replyDict);
        } catch (error) {
            console.error('Error parsing response as JSON:', error);
        }
    }

    fileStream.end();
})();
