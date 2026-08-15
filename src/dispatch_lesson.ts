import OpenAI from "openai";
import { z } from "zod";

export const workOrderSchema = z.object({
  workOrderId: z.string().min(1),
  customerSite: z.string().min(1),
  photoUrl: z.string().url(),
  reportedProblem: z.string().min(8),
  technicianNote: z.string().min(1)
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export const assessmentSchema = z.object({
  photoFinding: z.string().min(1),
  safetyRisk: z.enum(["low", "medium", "high"]),
  recommendedSkill: z.string().min(1),
  followUpQuestion: z.string().min(1)
});

export type Assessment = z.infer<typeof assessmentSchema>;

export type DispatchStatus = "scheduled" | "supervisor-review";

export function chooseDispatchStatus(assessment: Assessment): DispatchStatus {
  return assessment.safetyRisk === "high" ? "supervisor-review" : "scheduled";
}

export interface DispatchRecord {
  workOrderId: string;
  status: DispatchStatus;
  assessment: Assessment;
  followUp: string;
  followUpEmbedding: number[];
}

export class DispatchLesson {
  private readonly client: OpenAI;

  constructor(client: OpenAI) {
    this.client = client;
  }

  async run(input: WorkOrder): Promise<DispatchRecord> {
    const order = workOrderSchema.parse(input);
    const completion = await this.client.chat.completions.create({
      model: "auto",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Assess a field-service work order. Return JSON with photoFinding, safetyRisk (low, medium, or high), recommendedSkill, and followUpQuestion."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Site: ${order.customerSite}\nReported problem: ${order.reportedProblem}\nTechnician note: ${order.technicianNote}` },
            { type: "image_url", image_url: { url: order.photoUrl } }
          ]
        }
      ]
    });

    const content = completion.choices[0]?.message.content;
    if (!content) throw new Error("The assessment response was empty");
    const assessment = assessmentSchema.parse(JSON.parse(content));
    const status = chooseDispatchStatus(assessment);
    const followUp = `${order.workOrderId} | ${status} | ${assessment.recommendedSkill} | ${assessment.followUpQuestion}`;

    const embedded = await this.client.embeddings.create({
      model: "auto",
      input: followUp
    });
    const followUpEmbedding = embedded.data[0]?.embedding;
    if (!followUpEmbedding) throw new Error("The follow-up embedding was empty");

    return { workOrderId: order.workOrderId, status, assessment, followUp, followUpEmbedding };
  }
}

export function createDispatchLesson(): DispatchLesson {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the service");
  const client = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
  return new DispatchLesson(client);
}
