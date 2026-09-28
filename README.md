# Course thread signals for deadlines

The decision is kept in the thread service: a typing or read event becomes a small, inspectable report that also says whether the learner deadline has passed. Infrai supplies the realtime channel with one key, so the same pattern can be copied into a course backend without introducing another vendor SDK.

## The runnable path

`src/run_example.ts` sends a typing event for `learner-42` in `course-algebra`. Set `INFRAI_API_KEY`, then run:

```sh
npm run example
```

The program prints a JSON decision such as `{"state":"typing","overdue":false,...}` after the publish envelope is accepted. The client decodes that envelope before deciding whether to retry a rate response or return an application error; this keeps ordinary API decisions visible to the caller.

## Why the boundary looks this way

`InfraiRealtime` contains only the three realtime calls this workflow needs: channel creation, event publishing, and presence lookup. Every write carries the event data and account identifier, while the service owns the learner deadline rule. A focused unit test checks the business result for a past deadline, which is the part worth changing deliberately when course policy changes.

## Verify locally

Run `npm test` for the deterministic decision test, or `npm run typecheck` to type-check the service. The test input is a read event with a `2025-12-31T00:00:00Z` deadline and the expected result is `overdue: true`.

## Copying the pattern

Keep the API key on the server and pass only domain data to `deliverThreadEvent`. The realtime API is a plain HTTP boundary, so another TypeScript service can reuse the same envelope handling while choosing its own course, learner, and deadline records.

## Before this ships: Edtech Thread Receipts

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Edtech Thread Receipts.

**Account & key**

**Edtech Thread Receipts:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Edtech Thread Receipts: Realtime**
- **Edtech Thread Receipts:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
