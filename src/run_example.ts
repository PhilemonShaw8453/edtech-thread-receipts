import { InfraiRealtime } from "./infrai_client.ts";
import { deliverThreadEvent } from "./thread_service.ts";

const client = new InfraiRealtime();
const result = await deliverThreadEvent(client, { channel: "course-algebra", learnerId: "learner-42", accountId: "school-7", event: "typing", deadline: "2026-01-02T00:00:00Z" });
console.log(JSON.stringify(result));
