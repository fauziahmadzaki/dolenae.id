import { z } from "zod";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoCalendarDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function planDurationDays(startDate: string, endDate: string): number {
  const startMs = Date.parse(`${startDate}T00:00:00Z`);
  const endMs = Date.parse(`${endDate}T00:00:00Z`);
  return Math.round((endMs - startMs) / 86_400_000) + 1;
}

const isoCalendarDate = z
  .string()
  .trim()
  .refine(isValidIsoCalendarDate, {
    message: "Tanggal harus berformat YYYY-MM-DD yang valid",
  });

const dayItemSchema = z.object({
  destinationId: z.string().trim().max(80).nullable().optional(),
  destinationName: z.string().trim().min(1).max(160),
  routeId: z.string().trim().max(80).nullable().optional(),
  supportIds: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  activity: z.string().trim().min(1).max(200),
  startTime: z.string().trim().max(20).optional(),
  costEstimate: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(800).optional(),
});

const daySchema = z.object({
  day: z.number().int().min(1).max(30),
  title: z.string().trim().min(1).max(160),
  items: z.array(dayItemSchema).max(20),
});

const briefingSchema = z.object({
  grounded: z.array(z.string().trim().max(600)).max(30).default([]),
  general: z.array(z.string().trim().max(600)).max(30).default([]),
  warnings: z.array(z.string().trim().max(600)).max(30).default([]),
});

const sourceSchema = z.object({
  type: z.enum(["destination", "route", "support"]),
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(160),
});

const checklistItemSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(160),
  category: z.enum([
    "perlengkapan",
    "kesehatan",
    "konservasi",
    "administrasi",
    "biaya",
  ]),
  isRequired: z.boolean().default(true),
  isCompleted: z.boolean().optional(),
  isOwned: z.boolean().optional(),
  estimatedCost: z.number().int().min(0).max(1_000_000_000).nullable().optional(),
  note: z.string().trim().max(300).optional(),
  alternativeGroup: z.string().trim().max(80).optional(),
});

const destinationIdsSchema = z
  .array(z.string().trim().min(1).max(80))
  .max(20)
  .transform((ids) => [...new Set(ids)]);

const basePlanShape = {
  title: z.string().trim().min(1, "Judul rencana wajib diisi").max(160),
  startDate: isoCalendarDate,
  endDate: isoCalendarDate,
  peopleCount: z.coerce.number().int().min(1).max(30),
  totalBudget: z.coerce.number().int().min(0).max(1_000_000_000),
  originProvince: z.string().trim().max(100),
  note: z.string().trim().max(1000),
  summary: z.string().trim().max(2000),
  engine: z.enum(["draft", "gemini", "deterministic"]),
  notice: z.string().trim().max(600).nullable().optional(),
  aiWarning: z.string().trim().max(600).nullable().optional(),
  destinationIds: destinationIdsSchema,
  briefing: briefingSchema,
  days: z.array(daySchema).max(30),
  sources: z.array(sourceSchema).max(50),
  checklist: z.array(checklistItemSchema).max(100),
};

export const planIdParamsSchema = z.object({
  id: z.string().uuid("ID rencana tidak valid"),
});

export const planClientIdParamsSchema = z.object({
  clientId: z.string().trim().min(1, "Client ID wajib diisi").max(120),
});

export const createPlanSchema = z
  .object({
    clientId: z.string().trim().min(1).max(120).optional(),
    title: basePlanShape.title,
    startDate: basePlanShape.startDate,
    endDate: basePlanShape.endDate,
    peopleCount: basePlanShape.peopleCount.default(1),
    totalBudget: basePlanShape.totalBudget.default(0),
    originProvince: basePlanShape.originProvince.default(""),
    note: basePlanShape.note.default(""),
    summary: basePlanShape.summary.default(""),
    engine: basePlanShape.engine.default("draft"),
    notice: basePlanShape.notice,
    aiWarning: basePlanShape.aiWarning,
    destinationIds: basePlanShape.destinationIds.default([]),
    briefing: basePlanShape.briefing.default({
      grounded: [],
      general: [],
      warnings: [],
    }),
    days: basePlanShape.days.default([]),
    sources: basePlanShape.sources.default([]),
    checklist: basePlanShape.checklist.default([]),
  })
  .superRefine((data, ctx) => {
    const duration = planDurationDays(data.startDate, data.endDate);
    if (duration < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Tanggal selesai harus sama atau setelah tanggal mulai",
      });
    } else if (duration > 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Durasi rencana maksimal 30 hari",
      });
    }
  });

export const updatePlanSchema = z
  .object(basePlanShape)
  .partial()
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal satu field harus diisi",
      });
      return;
    }
    if (data.startDate && data.endDate) {
      const duration = planDurationDays(data.startDate, data.endDate);
      if (duration < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Tanggal selesai harus sama atau setelah tanggal mulai",
        });
      } else if (duration > 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "Durasi rencana maksimal 30 hari",
        });
      }
    }
  });
