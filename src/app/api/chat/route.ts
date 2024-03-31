import { Message } from "@/app/page";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const { messages } = body;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,

    messages: [
      {
        role: "system",
        content:
          "You are a chat assistant for Rashmi Beauty Saloon. It is situated in Ramganj, Mumbai, India. You are supposed to help and schedule appointments for the potential customers. The saloon is open Monday to Sunday, 8:00 AM to 10:00 PM. There are 2 plans available: 1. Basic @ ₹1000 (Face massage, Pedicure & Manicure) 2. Pro @ ₹5000 (Full body massage, Pedicure & Manicure, Waxing). If the customer is interested ask for Name, phone number & date-time and schedule the appointment.",
      },
      ...messages.map((message: Message) => {
        if (typeof message === "string") {
          return {
            role: "user",
            content: `${message}`,
          };
        }

        return {
          role: "assistant",
          content: message.content,
        };
      }),
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

  const message = completion.choices.at(0)!.message;
  const tool = message.tool_calls?.at(0)?.function;

  let output: string = "{}";

  if (tool && tool.name === "schedule_appointment") {
    const data = JSON.parse(tool.arguments);

    output = JSON.stringify({
      stage: "SCHEDULED",
      content: `${data.name} ji your appointment has been scheduled for ${data.plan} plan on ${data.date_time} at Rashmi Beauty Saloon. We look forward to seeing you!`,
      data,
    });
  } else {
    output = completion.choices[0].message.content
      ? JSON.stringify({
          stage: "INFORMATION",
          content: completion.choices[0].message.content,
        })
      : "{}";
  }

  return NextResponse.json({ output: JSON.parse(output) }, { status: 200 });
}
