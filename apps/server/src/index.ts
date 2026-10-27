import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { processWahaPayload } from "./webhooks/waha";
import { cors } from "@elysiajs/cors";
import { appRouter } from "@myrehat-task-b/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
  wrapLanguageModel,
} from "ai";
import { Elysia } from "elysia";

import { createContext } from "./context";
import { ENV } from "./env.server";
import { auth } from "./services";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

new Elysia()
  .use(
    cors({
      origin: ENV.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .all(
    "/rpc*",
    async (context) => {
      const { response } = await rpcHandler.handle(context.request, {
        prefix: "/rpc",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .all(
    "/api-reference*",
    async (context) => {
      const { response } = await apiHandler.handle(context.request, {
        prefix: "/api-reference",
        context: await createContext({ context }),
      });
      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  )
  .post("/ai", async (context) => {
    const body = (await context.request.json()) as { messages?: UIMessage[] };
    const uiMessages = body.messages || [];
    const model = wrapLanguageModel({
      model: google("gemini-2.5-flash"),
      middleware: devToolsMiddleware(),
    });
    const result = streamText({
      model,
      messages: await convertToModelMessages(uiMessages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  })

  .post("/api/webhooks/waha", async ({ request, set }) => {
    let input: unknown;

    try {
      input = await request.json();
    } catch {
      set.status = 400;
      return { error: "Request body must be valid JSON" };
    }

    try {
      const result = await processWahaPayload(input, async (message) => {
        if (!ENV.OPENROUTER_API_KEY?.trim()) {
          throw new Error("OPENROUTER_API_KEY is not configured");
        }

        const openrouter = createOpenRouter({
          apiKey: ENV.OPENROUTER_API_KEY,
        });

        const generated = await generateText({
          model: openrouter(ENV.OPENROUTER_MODEL),
          system:
            "You are a helpful homestay concierge. Reply briefly and politely. " +
            "Help users with homestay questions. Do not claim bookings or payments " +
            "have been completed. Reply in the language used by the customer.",
          prompt: message,
        });

        return generated.text;
      });

      set.status = result.status;
      return result.body;
    } catch (error) {
      console.error(
        "WAHA webhook processing failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
      set.status = 503;
      return { error: "Concierge service is temporarily unavailable" };
    }
  })  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

