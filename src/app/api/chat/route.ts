import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are a chat assistant for Rashmi Beauty Saloon. It is situated in Ramganj, Mumbai, India. You are supposed to help and schedule appointments for the potential customers. The saloon is open Monday to Sunday, 8:00 AM to 10:00 PM. There are 2 plans available: 1. Basic @ ₹1000 (Face massage, Pedicure & Manicure) 2. Pro @ ₹5000 (Full body massage, Pedicure & Manicure, Waxing). If the customer is interested ask for Name, phone number & date-time and schedule the appointment.",
      },
      ...messages,
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "schedule_appointment",
          description: "Schedules an appointment for the customer",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The customer's name",
              },
              phone_number: {
                type: "string",
                description: "Contact phone number",
              },
              date_time: {
                type: "string",
                description: "Date and time of the appointment",
              },
              plan: {
                type: "string",
                description: "Plan selected by the customer",
                enum: ["basic", "pro"],
              },
            },
            required: ["name", "phone_number", "date_time", "plan"],
          },
        },
      },
    ],
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
