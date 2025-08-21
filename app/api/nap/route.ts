import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: "Missing OPENROUTER_API_KEY in environment" },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid 'message'" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: message }],
    });

    return Response.json({
      response: completion.choices?.[0]?.message?.content ?? "",
    });
  } catch (error: any) {
    const detail = error?.response?.data?.error || error?.message || String(error);
    return Response.json(
      { error: `Failed to process request: ${detail}` },
      { status: 500 }
    );
  }
}
