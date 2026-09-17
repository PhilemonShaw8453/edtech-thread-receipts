import { InfraiRealtime } from "./infrai_client.ts";
import { z } from "zod";

export type ThreadInput = { channel: string; learnerId: string; accountId: string; event: "typing" | "read"; deadline: string };
export type ThreadDecision = { state: "typing" | "read"; overdue: boolean; deadline: string };
export const threadRequest = z.object({ channel: z.string().min(1), learnerId: z.string().min(1), accountId: z.string().min(1), event: z.enum(["typing", "read"]), deadline: z.string().datetime() });

export function decideThreadState(input: ThreadInput, now = new Date("2026-01-01T00:00:00Z")): ThreadDecision {
  return { state: input.event, overdue: new Date(input.deadline).getTime() < now.getTime(), deadline: input.deadline };
}

export async function deliverThreadEvent(client: InfraiRealtime, input: ThreadInput): Promise<ThreadDecision> {
  const validatedInput = threadRequest.parse(input) as ThreadInput;
  const decision = decideThreadState(validatedInput);
  await client.publish(validatedInput.channel, validatedInput.event, { learner_id: validatedInput.learnerId, deadline: decision.deadline, overdue: decision.overdue }, validatedInput.accountId);
  return decision;
}
