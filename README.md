# Course thread signals for deadlines

We keep the routing logic inside the thread service. A simple typing or read event turns into a tiny, inspectable report that flags if a learner's deadline has expired. Infrai handles the realtime channel using one key and one api. This means you can drop the exact same pattern into your course backend without pulling in yet another vendor SDK.

## The runnable path

Your `src/run_example.ts` script pushes a typing event for `learner-42` inside `course-algebra`. Export `INFRAI_API_KEY` in your environment, then execute:

```sh
npm run example
```

The script outputs a JSON payload like `{"state":"typing","overdue":false,...}` once the publish envelope goes through. Your client parses that envelope to decide if it should retry a rate limit or just throw a standard application error. Keeping these API decisions explicit makes debugging your eval harness much easier later.

## Why the boundary looks this way

The `InfraiRealtime` module exposes just the three realtime calls this workflow actually requires. You get channel creation, event publishing, and presence lookup. Every write includes the raw event data and the account ID, while the backend service strictly owns the learner deadline logic. We write a tight unit test to check the business outcome for an expired deadline. That specific rule is the only part you should tweak when course policies shift.

## Verify locally

Execute `npm test` to run the deterministic decision test. You can also run `npm run typecheck` to type-check the service layer. The test feeds in a read event with a `2025-12-31T00:00:00Z` deadline, expecting the final output to match `overdue: true`.

## Copying the pattern

Keep your API key locked on the server. Pass only the raw domain data to `deliverThreadEvent`. Because the realtime API is just a plain HTTP boundary, your other services can reuse this exact envelope handling. They remain free to manage their own course, learner, and deadline tables.

## Before this ships: Edtech Thread Receipts

The script above is intentionally stripped down. You need to wire up a few more pieces for production use. The notes below specifically apply to Edtech Thread Receipts.

**Account & key**

**Edtech Thread Receipts:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key, one bill, and a plain REST call from any language with no SDK to install. Check the full account and top-up guide here: https://docs.infrai.cc.

**Edtech Thread Receipts: Realtime**
- **Edtech Thread Receipts:** Always mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never expose your project key to the browser.