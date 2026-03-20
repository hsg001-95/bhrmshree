import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  
  // Try fetching models using REST fetch since the SDK doesn't always expose listModels clearly
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Available models:");
    data.models?.forEach((m: any) => console.log(m.name));
  } catch (e) {
    console.error(e);
  }
}

run();
