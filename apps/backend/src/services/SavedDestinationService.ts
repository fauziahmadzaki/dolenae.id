import { savedDestinationRepository } from "../repositories/SavedDestinationRepository";
import type {
  PublicSavedDestination,
  SavedDestinationDeleteResult,
} from "../types/savedDestination";
import { NotFoundError, UnauthorizedError, ValidationError } from "../utils/errors";
import { destinationService } from "./DestinationService";

class SavedDestinationService {
  private static readonly MAX_SAVED_PER_USER = 200;

  async list(userId: string): Promise<PublicSavedDestination[]> {
    const pairs = await savedDestinationRepository.listByUser(userId);
    if (pairs.length === 0) return [];
    const hydrated = await destinationService.hydratePublicDestinations(
      pairs.map((pair) => pair.destination),
    );
    const byId = new Map(hydrated.map((dest) => [dest.id, dest]));
    return pairs.map((pair) => ({
      id: `${pair.saved.userId}:${pair.saved.destinationId}`,
      destinationId: pair.saved.destinationId,
      savedAt: pair.saved.createdAt.toISOString(),
      destination: byId.get(pair.saved.destinationId)!,
    }));
  }

  async save(
    userId: string,
    destinationId: string,
  ): Promise<{ item: PublicSavedDestination; created: boolean }> {
    const result = await savedDestinationRepository.saveForUser(
      userId,
      destinationId,
      SavedDestinationService.MAX_SAVED_PER_USER,
    );
    if (result.status === "user_not_found") {
      throw new UnauthorizedError("Sesi pengguna tidak valid");
    }
    if (result.status === "not_found") {
      throw new NotFoundError("Destinasi tidak ditemukan");
    }
    if (result.status === "limit_reached") {
      throw new ValidationError(
        `Batas maksimum ${SavedDestinationService.MAX_SAVED_PER_USER} destinasi tersimpan tercapai`,
      );
    }
    const [destination] = await destinationService.hydratePublicDestinations([
      result.destination,
    ]);
    return {
      item: {
        id: `${result.row.userId}:${result.row.destinationId}`,
        destinationId: result.row.destinationId,
        savedAt: result.row.createdAt.toISOString(),
        destination: destination!,
      },
      created: result.status === "created",
    };
  }

  async remove(
    userId: string,
    destinationId: string,
  ): Promise<SavedDestinationDeleteResult> {
    return savedDestinationRepository.removeForUser(userId, destinationId);
  }
}

export const savedDestinationService = new SavedDestinationService();
