import type { RxJsonSchema } from "rxdb";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  status: "Not started" | "In progress" | "Blocked" | "Final Check awaiting" | "Done";
}

export interface TaskDocType {
  id: string;
  userId: string;
  title: string;
  description?: string;
  floorPlanX?: number;
  floorPlanY?: number;
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export const taskSchema: RxJsonSchema<TaskDocType> = {
  title: "task schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 50 },
    userId: { type: "string", maxLength: 50 },
    title: { type: "string" },
    description: { type: "string" },
    floorPlanX: { type: "number" },
    floorPlanY: { type: "number" },
    checklistItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          done: { type: "boolean" },
          status: {
            type: "string",
            enum: ["Not started", "In progress", "Blocked", "Final Check awaiting", "Done"],
          },
        },
        required: ["id", "label", "done", "status"],
      },
    },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  required: ["id", "userId", "title", "checklistItems", "createdAt", "updatedAt"],
};
