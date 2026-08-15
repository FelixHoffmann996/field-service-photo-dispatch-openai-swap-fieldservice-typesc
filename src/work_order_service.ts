import { createServer } from "node:http";
import { ZodError } from "zod";
import { createDispatchLesson, workOrderSchema } from "./dispatch_lesson.js";

const dispatchLesson = createDispatchLesson();
const port = Number(process.env.PORT ?? 3000);

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/work-orders/assess") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Route not found" }));
    return;
  }

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const order = workOrderSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const record = await dispatchLesson.run(order);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(record));
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid work order", details: error.message }));
      return;
    }
    console.error(error);
    response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Assessment could not be completed" }));
  }
});

server.listen(port, () => console.log(`Work-order lesson listening on http://localhost:${port}`));
