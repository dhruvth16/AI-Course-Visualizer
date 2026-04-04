// import { NextRequest } from "next/server";
// import { GoogleGenAI } from "@google/genai";
// import { readFile } from "node:fs/promises";
// import axios from "axios";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GOOGLE_GENAI_API_KEY!,
//   // optionally: vertexai: true, project: …, location: … if using Vertex AI
// });

// export async function POST(req: NextRequest) {
//   try {
//     const { lesson_name, model, grade } = await req.json();

//     if (!lesson_name || !model || !grade) {
//       return new Response("Missing required fields", { status: 400 });
//     }

//     const prompt = `
// Generate a valid Mermaid.js flowchart code for the lesson "${lesson_name}" for grade ${grade}.

// Requirements:
// - Output only the Mermaid.js code (no explanations, no markdown, no extra text).
// - Start strictly with one of: "flowchart TD", "flowchart LR", "graph TD", or "graph LR".
// - Include all major subtopics and their dependencies in a logical hierarchy.
// - Ensure the code is syntactically correct and does not break when rendered.
// - Remove all round brackets and square brackets from labels to prevent rendering errors.
// - Use clear and concise labels for nodes (avoid long sentences).
// - Verify the diagram flows smoothly and looks balanced.
// - Fix any Mermaid syntax issues.
//     `;

//     // Use the SDK’s generation method (non-streaming for simplicity, streaming also possible)
//     const response = await ai.models.generateContent({
//       model,
//       contents: prompt,
//     });

//     const mermaidCode = response.text;

//     return new Response(mermaidCode, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Cache-Control": "no-cache",
//       },
//     });
//   } catch (error) {
//     console.error("Error generating mermaid with GenAI:", error);
//     return new Response("Failed to generate Mermaid diagram", { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
//   const stream = false;

//   try {
//     const { lesson_name, model, grade } = await req.json();

//     const headers = {
//       Authorization:
//         "Bearer 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",
//       Accept: stream ? "text/event-stream" : "application/json",
//     };

//     const payload = {
//       model: "google/gemma-4-31b-it",
//       messages: [{ role: "user", content: lesson_name }],
//       max_tokens: 16384,
//       temperature: 1.0,
//       top_p: 0.95,
//       stream: stream,
//       chat_template_kwargs: { enable_thinking: true },
//     };

//     const response = await axios.post(invokeUrl, payload, {
//       headers: headers,
//       responseType: stream ? "stream" : "json",
//     });

//     if (stream) {
//       response.data.on("data", (chunk: any) => {
//         console.log(chunk.toString());
//       });
//     } else {
//       console.log(JSON.stringify(response.data));
//       return new Response(JSON.stringify(response.data), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
//   } catch (error: any) {
//     console.error("Error:", error?.response?.data || error.message);

//     return new Response(
//       JSON.stringify({
//         error: "Something went wrong",
//         details: error?.response?.data || error.message,
//       }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       },
//     );
//   }
// }

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

export async function POST(req: NextRequest) {
  const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
  const stream = false;

  try {
    const { lesson_name, model, grade } = await req.json();

    if (!lesson_name || !model || !grade) {
      return new Response("Missing required fields", { status: 400 });
    }

    const prompt = `
Generate a valid Mermaid.js flowchart code for the lesson "${lesson_name}" for grade ${grade}.

Requirements:
- Output only the Mermaid.js code (no explanations, no markdown, no extra text).
- Start strictly with one of: "flowchart TD", "flowchart LR", "graph TD", or "graph LR".
- Include all major subtopics and their dependencies in a logical hierarchy.
- Ensure the code is syntactically correct and does not break when rendered.
- Remove all round brackets and square brackets from labels to prevent rendering errors.
- Use clear and concise labels for nodes (avoid long sentences).
- Verify the diagram flows smoothly and looks balanced.
- Fix any Mermaid syntax issues.
    `;

    const headers = {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      Accept: stream ? "text/event-stream" : "application/json",
    };

    const payload = {
      model: model || "google/gemma-4-31b-it",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.95,
      stream: stream,
    };

    const response = await axios.post(invokeUrl, payload, {
      headers,
      responseType: stream ? "stream" : "json",
    });

    const mermaidCode = response.data?.choices?.[0]?.message?.content || "";

    return NextResponse.json(mermaidCode, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error(
      "Error generating mermaid with NVIDIA API:",
      error?.response?.data || error.message,
    );

    return NextResponse.json(
      { error: "Failed to generate Mermaid diagram" },
      {
        status: 500,
      },
    );
  }
}
