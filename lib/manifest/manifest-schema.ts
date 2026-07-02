import { z } from "zod";

export const ManifestStatusSchema = z.enum(["draft", "scheduled", "posted"]);
export type ManifestStatus = z.infer<typeof ManifestStatusSchema>;

// A "local wall-clock" date-time with no zone offset baked in; the paired
// `timezone` field (an IANA zone name) is what gives it meaning, per
// constitution Principle V and spec FR-006/FR-007.
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

export const ManifestEntrySchema = z
  .object({
    entryId: z.string().min(1),
    contentId: z.string().min(1),
    status: ManifestStatusSchema,
    scheduledAt: z.string().regex(localDateTimePattern).optional(),
    timezone: z.string().min(1).optional(),
    repostOf: z.string().min(1).optional(),
  })
  .refine(
    (entry) => {
      if (entry.status === "scheduled" || entry.status === "posted") {
        return Boolean(entry.scheduledAt) && Boolean(entry.timezone);
      }
      return true;
    },
    {
      message: "scheduledAt and timezone are required once status is scheduled or posted",
    },
  );

export type ManifestEntry = z.infer<typeof ManifestEntrySchema>;

export const ManifestFileSchema = z.object({
  entries: z.array(ManifestEntrySchema).default([]),
});

export type ManifestFile = z.infer<typeof ManifestFileSchema>;
