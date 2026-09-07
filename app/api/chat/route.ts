import {
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3003";

const buildProxyHeaders = (upstream: Response) => ({
  "Content-Type":
    upstream.headers.get("Content-Type") ?? "text/plain; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const upstream = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, stream: true }),
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text();
      return new Response(errorText || "Upstream error", {
        status: upstream.status,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const contentType = upstream.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream")) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: buildProxyHeaders(upstream),
      });
    }

    if (contentType.includes("application/json")) {
      const data = await upstream.clone().json();

      if (data && typeof data === "object") {
        const { content, message, text, output } = data as {
          content?: unknown;
          message?: unknown;
          text?: unknown;
          output?: unknown;
        };

        const responseContent =
          typeof content === "string"
            ? content
            : typeof message === "string"
              ? message
              : typeof text === "string"
                ? text
                : typeof output === "string"
                  ? output
                  : "";

        if (responseContent) {
          const stream = createUIMessageStream({
            execute: ({ writer }) => {
              const id = crypto.randomUUID();
              writer.write({ type: "text-start", id });
              writer.write({ type: "text-delta", delta: responseContent, id });
              writer.write({ type: "text-end", id });
              writer.write({ type: "finish", finishReason: "stop" });
            },
          });

          return createUIMessageStreamResponse({ stream });
        }
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: buildProxyHeaders(upstream),
    });
  } catch (error) {
    return new Response(
      (error as Error).message || "Bad gateway",
      { status: 502, headers: { "Content-Type": "text/plain" } }
    );
  }
}
