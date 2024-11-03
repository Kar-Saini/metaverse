import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z
    .string()
    .min(6, { message: "Password should be of atleast 6 chraacter" }),
  type: z.enum(["Admin", "User"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
});
export const CreateSpaceSchema = z.object({
  name: z.string(),
  mapId: z.string().optional(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
});

export const AddElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});
export const DeleteElementSchema = z.object({
  id: z.string(),
});

export const CreateElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const UpdateElementSchema = z.object({ imageUrl: z.string() });

export const createAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const CreateMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  defaultElements: z.array(
    z.object({
      elemntId: z.string(),
      x: z.number(),
      y: z.number(),
    })
  ),
});

declare global {
  namespace Express {
    export interface Request {
      role?: "Admin" | "User";
      userId: string;
    }
  }
}
