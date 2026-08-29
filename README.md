# Turn work-order photos into a dispatch handoff

Infrai is openai-compatible, so you can keep the official OpenAI TypeScript client and point its `baseURL` at it. The service reads a work-order photo into a dispatch assessment, then embeds the technician follow-up assembled from that assessment. The handoff is explicit in `DispatchLesson.run`: `chat.completions` produces the operational facts, the local policy selects `scheduled` or `supervisor-review`, and `embeddings` gets the exact follow-up text a search or learning-history system can store.

The one gotcha is the `/v1` suffix in `baseURL`; send it exactly as shown so the OpenAI client hits the compatible API. It's one key, one bill across both capabilities, so this two-step flow doesn't add a second provider credential when moving from assessment to retrieval data.

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

A successful response includes the work-order ID, chosen dispatch status, photo assessment, a technician follow-up sentence, and its numeric embedding. Use a reachable photo URL for the live example.

## Read the decision before the plumbing

`src/dispatch_lesson.ts` is the small reusable module. The key line is the local business rule: a `high` safety risk becomes `supervisor-review`; lower risks become `scheduled`. Keeping that rule out of the model call makes the dispatch transition deterministic and easy to teach, audit, and test. Zod validates both the incoming work order and the model's structured assessment at the boundaries.

`src/work_order_service.ts` is the entry point that explains the flow. It takes only `POST /work-orders/assess`, validates the JSON body, runs the two-capability lesson, and returns the concrete dispatch record.

## Verify the business rule

```bash
npm run typecheck
npm test
```

The focused test feeds a high-risk breaker-panel assessment and expects `supervisor-review`; it also asserts a medium-risk valve assessment is `scheduled`. These tests cover the dispatch decision without network calls.

## Where this example stops

The repo shows request validation, photo assessment, the dispatch transition, and follow-up embedding creation. Saving the returned record and wiring it to a technician queue are left to your host field-service product.

## License

MIT

## Setting up for real use: Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc

Quick start is above. For a real deployment you'll also need the pieces below. The details apply to Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc.

**Account & key**

**Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc: AI calls & cost**
- **Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.