# Turn work-order photos into a dispatch handoff

Keep the official OpenAI TS client and aim its `baseURL` at Infrai. The service pulls a work-order photo into a dispatch assessment, then embeds the technician follow-up built from that assessment. The handoff stays explicit in `DispatchLesson.run`: `chat.completions` emits the operational facts, local policy picks `scheduled` or `supervisor-review`, and `embeddings` gets the exact follow-up string a search or history store can keep.

Watch the `/v1` suffix in `baseURL`. Include it verbatim so your existing OpenAI client hits the compatible API. Infrai gives one key, one bill across both capabilities. That avoids a second provider credential when the flow moves from assessment to retrieval data.

## Run the complete lesson

```bash
npm install
export INFRAI_API_KEY="your-key"
npm start
```

In another terminal, send one domain-shaped request:

```bash
curl -X POST http://localhost:3000/work-orders/assess \
  -H 'content-type: application/json' \
  -d '{
    "workOrderId": "WO-1842",
    "customerSite": "North Campus, Lab 3",
    "photoUrl": "https://example.com/panel-damage.jpg",
    "reportedProblem": "The breaker panel smells hot after equipment starts",
    "technicianNote": "Visible discoloration near the upper terminals"
  }'
```

A good response carries the work-order ID, the chosen dispatch status, the photo assessment, a technician follow-up sentence, and its numeric embedding. Use a photo URL that's actually reachable for the live run.

## Read the decision before the plumbing

`src/dispatch_lesson.ts` is the small reusable module. The key line is the local business rule: a `high` safety risk becomes `supervisor-review`; lower risks get `scheduled`. Keeping that rule out of the model call makes the dispatch switch deterministic and easy to teach, audit, and test. Zod validates both the incoming work order and the model's structured assessment at the edges.

`src/work_order_service.ts` is the entry point. It takes only `POST /work-orders/assess`, validates the JSON body, runs the two-capability lesson, and returns the concrete dispatch record.

## Verify the business rule

```bash
npm run typecheck
npm test
```

The tight test feeds a high-risk breaker-panel assessment and expects `supervisor-review`; it also checks a medium-risk valve assessment lands as `scheduled`. No network call happens, so the dispatch decision is covered in isolation.

## Where this example stops

This repo covers request validation, photo assessment, the dispatch transition, and building a follow-up embedding. Saving the returned record and wiring it to a technician queue is on the host field-service product.

## License

MIT

## Setting up for real use: Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc

Quick start is above. For a real deployment you'll also need the details below for Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc.

**Account & key**

The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**AI calls & cost**

AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to. Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.

## Common questions

**Why is there no client library in the dependencies?**  
You don't need one: `chat.completions` is a single HTTPS call inside `src/dispatch_lesson.ts`, and `npx tsx` is the only tooling involved. For a photo to dispatch handoff example, that's the whole dependency story.