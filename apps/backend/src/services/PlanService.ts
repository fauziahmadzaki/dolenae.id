import type { TripPlanRow } from "../db/models";
import { planRepository } from "../repositories/PlanRepository";
import { planDurationDays } from "../schemas/plan.schema";
import type {
  CreatePlanBody,
  PlanPatch,
  PublicTripPlan,
  TripPlanDay,
  TripPlanEngine,
  UpdatePlanBody,
} from "../types/plan";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";

class PlanService {
  private static readonly MAX_PLANS_PER_USER = 100;
  private static readonly MAX_DESTINATION_IDS = 20;

  private toPublic(row: TripPlanRow): PublicTripPlan {
    return {
      id: row.id,
      userId: row.userId,
      clientId: row.clientId ?? null,
      title: row.title,
      startDate: row.startDate,
      endDate: row.endDate,
      peopleCount: row.peopleCount,
      totalBudget: row.totalBudget,
      originProvince: row.originProvince,
      note: row.note,
      summary: row.summary,
      engine: row.engine as TripPlanEngine,
      notice: row.notice ?? null,
      aiWarning: row.aiWarning ?? null,
      destinationIds: row.destinationIds ?? [],
      briefing: row.briefingJson ?? { grounded: [], general: [], warnings: [] },
      days: row.daysJson ?? [],
      sources: row.sourcesJson ?? [],
      checklist: row.checklistJson ?? [],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private reconcileDestinationIds(
    explicitIds: string[],
    days: TripPlanDay[],
  ): string[] {
    const merged = new Set<string>();
    for (const id of explicitIds) {
      const trimmed = id.trim();
      if (trimmed) merged.add(trimmed);
    }
    for (const day of days) {
      for (const item of day.items) {
        const trimmed = item.destinationId?.trim();
        if (trimmed) merged.add(trimmed);
      }
    }
    if (merged.size > PlanService.MAX_DESTINATION_IDS) {
      throw new ValidationError(
        `Maksimal ${PlanService.MAX_DESTINATION_IDS} destinasi unik dalam satu rencana`,
      );
    }
    return [...merged];
  }

  async list(userId: string): Promise<PublicTripPlan[]> {
    const rows = await planRepository.listByUser(userId);
    return rows.map((row) => this.toPublic(row));
  }

  async getById(id: string, userId: string): Promise<PublicTripPlan> {
    const row = await planRepository.findByIdForUser(id, userId);
    if (!row) {
      throw new NotFoundError("Rencana perjalanan tidak ditemukan");
    }
    return this.toPublic(row);
  }

  async create(
    userId: string,
    body: CreatePlanBody,
  ): Promise<{ plan: PublicTripPlan; created: boolean }> {
    const destinationIds = this.reconcileDestinationIds(
      body.destinationIds,
      body.days,
    );

    const result = await planRepository.createWithLimitForUser(
      userId,
      PlanService.MAX_PLANS_PER_USER,
      {
        userId,
        clientId: body.clientId ?? null,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate,
        peopleCount: body.peopleCount,
        totalBudget: body.totalBudget,
        originProvince: body.originProvince,
        note: body.note,
        summary: body.summary,
        engine: body.engine,
        notice: body.notice ?? null,
        aiWarning: body.aiWarning ?? null,
        destinationIds,
        briefingJson: body.briefing,
        daysJson: body.days,
        sourcesJson: body.sources,
        checklistJson: body.checklist,
      },
    );

    switch (result.status) {
      case "deleted":
        throw new ConflictError(
          "Rencana ini sudah dihapus",
          undefined,
          "PLAN_CLIENT_DELETED",
        );
      case "limit_reached":
        throw new ValidationError(
          `Batas maksimal ${PlanService.MAX_PLANS_PER_USER} rencana perjalanan per akun tercapai`,
        );
      case "existing":
        return { plan: this.toPublic(result.row), created: false };
      case "created":
        return { plan: this.toPublic(result.row), created: true };
    }
  }

  async update(
    id: string,
    userId: string,
    body: UpdatePlanBody,
  ): Promise<PublicTripPlan> {
    const updated = await planRepository.updateForUserLocked(
      id,
      userId,
      (existing) => {
        const nextStartDate = body.startDate ?? existing.startDate;
        const nextEndDate = body.endDate ?? existing.endDate;
        const duration = planDurationDays(nextStartDate, nextEndDate);
        if (duration < 1) {
          throw new ValidationError(
            "Tanggal selesai harus sama atau setelah tanggal mulai",
          );
        }
        if (duration > 30) {
          throw new ValidationError("Durasi rencana maksimal 30 hari");
        }

        const patch: PlanPatch = {
          updatedAt: new Date(),
        };
        if (body.title !== undefined) patch.title = body.title;
        if (body.startDate !== undefined) patch.startDate = body.startDate;
        if (body.endDate !== undefined) patch.endDate = body.endDate;
        if (body.peopleCount !== undefined) patch.peopleCount = body.peopleCount;
        if (body.totalBudget !== undefined) patch.totalBudget = body.totalBudget;
        if (body.originProvince !== undefined) {
          patch.originProvince = body.originProvince;
        }
        if (body.note !== undefined) patch.note = body.note;
        if (body.summary !== undefined) patch.summary = body.summary;
        if (body.engine !== undefined) patch.engine = body.engine;
        if (body.notice !== undefined) patch.notice = body.notice;
        if (body.aiWarning !== undefined) patch.aiWarning = body.aiWarning;
        if (body.briefing !== undefined) patch.briefingJson = body.briefing;
        if (body.days !== undefined) patch.daysJson = body.days;
        if (body.sources !== undefined) patch.sourcesJson = body.sources;
        if (body.checklist !== undefined) patch.checklistJson = body.checklist;

        if (body.destinationIds !== undefined && body.days !== undefined) {
          patch.destinationIds = this.reconcileDestinationIds(
            body.destinationIds,
            body.days,
          );
        } else if (body.destinationIds !== undefined) {
          const existingDays = existing.daysJson ?? [];
          const submittedSet = new Set(
            body.destinationIds.map((d) => d.trim()).filter(Boolean),
          );
          for (const day of existingDays) {
            for (const item of day.items) {
              const itemDestId = item.destinationId?.trim();
              if (itemDestId && !submittedSet.has(itemDestId)) {
                throw new ValidationError(
                  "Destinasi pada jadwal hari tidak boleh dihapus tanpa memperbarui jadwal hari",
                );
              }
            }
          }
          patch.destinationIds = this.reconcileDestinationIds(
            body.destinationIds,
            existingDays,
          );
        } else if (body.days !== undefined) {
          patch.destinationIds = this.reconcileDestinationIds(
            existing.destinationIds ?? [],
            body.days,
          );
        }

        return patch;
      },
    );

    if (!updated) {
      throw new NotFoundError("Rencana perjalanan tidak ditemukan");
    }
    return this.toPublic(updated);
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<{ deleted: true; id: string }> {
    const deleted = await planRepository.deleteForUser(id, userId);
    if (!deleted) {
      throw new NotFoundError("Rencana perjalanan tidak ditemukan");
    }
    return { deleted: true, id };
  }

  async removeByClientId(
    clientId: string,
    userId: string,
  ): Promise<{ deleted: true; clientId: string }> {
    return planRepository.deleteByClientIdForUser(userId, clientId);
  }
}

export const planService = new PlanService();
