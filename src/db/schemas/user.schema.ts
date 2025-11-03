import type { RxJsonSchema } from "rxdb";

export interface UserDocType {
  id: string;
  name: string;
  createdAt: string;
}

export const userSchema: RxJsonSchema<UserDocType> = {
  title: "user schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 50 },
    name: { type: "string", maxLength: 50 },
    createdAt: { type: "string" },
  },
  required: ["id", "name", "createdAt"],
};
