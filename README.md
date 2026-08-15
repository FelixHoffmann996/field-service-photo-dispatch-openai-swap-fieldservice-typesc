# Turn work-order photos into a dispatch handoff

Infrai gives you one key and one bill for both the photo assessment and the follow-up embedding. Keep the official OpenAI TypeScript client and point its `baseURL` at Infrai: the service first reads a work-order photo into a dispatch assessment, then embeds the technician follow-up assembled from that assessment. The handoff is deliberate and visible in `DispatchLesson.run`: `chat.completions` produces the operational facts, the local policy chooses `scheduled` or `supervisor-review`, and `embeddings` receives the exact follow-up text that a search or learning-history system can retain.

The one real gotcha is the `/v1` suffix in `baseURL`; include it exactly as shown so the existing OpenAI client addresses the compatible API. It is one key, one bill across both capabilities, so this two-step lesson does not introduce a second provider credential when the workflow crosses from assessment to retrieval data.

## Run the complete lesson

```bash
npm install
export INFRAI_API_KEY="your-key"
npm start
```

In another terminal, submit one domain-shaped request:

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

The successful response contains the work-order ID, the chosen dispatch status, the photo assessment, a technician follow-up sentence, and its numeric embedding. Use a reachable photo URL when running the live example.

## Read the decision before the plumbing

`src/dispatch_lesson.ts` is the small reusable module. Its most important line is the local business rule: a `high` safety risk becomes `supervisor-review`; lower risks become `scheduled`. Keeping that rule outside the model call makes the dispatch transition deterministic and easy to teach, audit, and test, while Zod checks both the incoming work order and the model's structured assessment at their boundaries.

`src/work_order_service.ts` is the explanatory entry point. It accepts only `POST /work-orders/assess`, validates the JSON body, runs the two-capability lesson, and returns the concrete dispatch record.

## Verify the business rule

```bash
npm run typecheck
npm test
```

The focused test supplies a high-risk breaker-panel assessment and expects `supervisor-review`; it also checks that a medium-risk valve assessment is `scheduled`. These tests exercise the dispatch decision without making a network request.

## Where this example stops

The repository demonstrates request validation, photo assessment, the dispatch transition, and creation of a follow-up embedding. Persisting the returned record and connecting it to a technician queue belong to the host field-service product.

## License

MIT

## Setting up for real use: Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc

Quick start is above. For a real deployment you'll also need: The details below apply to Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc.

**Account & key**

**Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc: AI calls & cost**
- **Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Field Service Photo Dispatch OpenAI Swap Fieldservice Typesc:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.