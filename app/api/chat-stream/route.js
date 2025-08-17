import OpenAI from "openai";
import { NextResponse } from "next/server";
import Stream from "stream";
import { Responses } from "openai/resources/index";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

    // Create a streaming chat completion
export async function POST(request) {
  try {
    const { message } = await request.json();
    // Create a streaming chat completion
    const Stream = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: message }],
      Stream: true,
    });
    // Create a text encoder
    const encoder = new TextEncoder();

    // Actual streaming response
    const readable = new ReadableStream({
      async start(controller) {
            for await (const chunk of Stream) {
            // Check if the chunk has choices and content
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}`)
            );
          }
        }
        controller.close();
      },
    });
    // Return the streaming response
      return new Response(readable, {
        // Set the appropriate headers
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "Keep-alive",
          },
    });
  } catch (error) {
    console.error("API Error:", error);
    return Responses.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
