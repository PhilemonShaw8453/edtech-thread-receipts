import assert from "node:assert/strict";
import { decideThreadState } from "../src/thread_service.ts";

const result = decideThreadState({ channel: "course", learnerId: "l1", accountId: "a1", event: "read", deadline: "2025-12-31T00:00:00Z" });
assert.deepEqual(result, { state: "read", overdue: true, deadline: "2025-12-31T00:00:00Z" });
console.log("thread decision test passed");
