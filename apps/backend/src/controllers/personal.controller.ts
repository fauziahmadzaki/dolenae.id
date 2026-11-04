import type { RequestHandler } from "express";
import { getValidated } from "../middleware/validate";
import { personalService as service } from "../services/personal.service";
import type { PaginationQuery } from "../utils/pagination";
import type { CreateFaqInput, PatchFaqInput, CreateFeedbackInput } from "./personal.schema";
import { ok } from "../utils/response";
import type { CreateTripInput, PatchTripInput, CreateTripItemInput, PatchTripItemInput, CreateChecklistItemInput, PatchChecklistItemInput, PatchSettingsInput } from "./personal.schema";

const id = (req: Parameters<RequestHandler>[0]) => getValidated<{ id: string }>(req, "params").id;
const itemId = (req: Parameters<RequestHandler>[0]) => getValidated<{ itemId: string }>(req, "params").itemId;
const destId = (req: Parameters<RequestHandler>[0]) => getValidated<{ destId: string }>(req, "params").destId;
export const personalController = {
  listFaqs: (async (_req, res) => { ok(res, await service.listFaqs()); }) satisfies RequestHandler,
  listAdminFaqs: (async (req, res) => { const { items, meta } = await service.listAdminFaqs(getValidated<PaginationQuery>(req, "query")); ok(res, items, meta); }) satisfies RequestHandler,
  getFaq: (async (req, res) => { ok(res, await service.getFaq(id(req))); }) satisfies RequestHandler,
  createFaq: (async (req, res) => { ok(res, await service.createFaq(getValidated<CreateFaqInput>(req, "body")), undefined, 201); }) satisfies RequestHandler,
  updateFaq: (async (req, res) => { ok(res, await service.updateFaq(id(req), getValidated<PatchFaqInput>(req, "body"))); }) satisfies RequestHandler,
  deleteFaq: (async (req, res) => { ok(res, await service.deleteFaq(id(req))); }) satisfies RequestHandler,
  createFeedback: (async (req, res) => { ok(res, await service.createFeedback(req.user!.id, getValidated<CreateFeedbackInput>(req, "body")), undefined, 201); }) satisfies RequestHandler,
  listAdminFeedback: (async (req, res) => { const { items, meta } = await service.listAdminFeedback(getValidated<PaginationQuery>(req, "query")); ok(res, items, meta); }) satisfies RequestHandler,
  listNotifications: (async (req, res) => { ok(res, await service.listNotifications(req.user!.id)); }) satisfies RequestHandler,
  readNotification: (async (req, res) => { ok(res, await service.readNotification(req.user!.id, id(req))); }) satisfies RequestHandler,
  readAllNotifications: (async (req, res) => { ok(res, await service.readAllNotifications(req.user!.id)); }) satisfies RequestHandler,
  getSettings: (async (req, res) => { ok(res, await service.getSettings(req.user!.id)); }) satisfies RequestHandler,
  updateSettings: (async (req, res) => { ok(res, await service.updateSettings(req.user!.id, getValidated<PatchSettingsInput>(req, "body"))); }) satisfies RequestHandler,
  listSavedDestinations: (async (req, res) => { ok(res, await service.listSavedDestinations(req.user!.id)); }) satisfies RequestHandler,
  saveDestination: (async (req, res) => { ok(res, await service.saveDestination(req.user!.id, getValidated<{ destinationId: string }>(req, "body").destinationId), undefined, 201); }) satisfies RequestHandler,
  deleteSavedDestination: (async (req, res) => { ok(res, await service.deleteSavedDestination(req.user!.id, getValidated<{ destinationId: string }>(req, "params").destinationId)); }) satisfies RequestHandler,
  listSavedPlans: (async (req, res) => { ok(res, await service.listSavedPlans(req.user!.id)); }) satisfies RequestHandler,
  updateSavedPlan: (async (req, res) => { ok(res, await service.updateSavedPlan(req.user!.id, id(req), getValidated<{ status: "aktif" | "arsip" }>(req, "body").status)); }) satisfies RequestHandler,
  listChecklist: (async (req, res) => { ok(res, await service.listChecklist(req.user!.id, id(req))); }) satisfies RequestHandler,
  createChecklistItem: (async (req, res) => { ok(res, await service.createChecklistItem(req.user!.id, destId(req), getValidated<CreateChecklistItemInput>(req, "body")), undefined, 201); }) satisfies RequestHandler,
  updateChecklistItem: (async (req, res) => { ok(res, await service.updateChecklistItem(req.user!.id, destId(req), id(req), getValidated<PatchChecklistItemInput>(req, "body"))); }) satisfies RequestHandler,
  deleteChecklistItem: (async (req, res) => { ok(res, await service.deleteChecklistItem(req.user!.id, destId(req), id(req))); }) satisfies RequestHandler,
  listSavedChecklists: (async (req, res) => { ok(res, await service.listSavedChecklists(req.user!.id)); }) satisfies RequestHandler,
  deleteSavedChecklist: (async (req, res) => { ok(res, await service.deleteSavedChecklist(req.user!.id, id(req))); }) satisfies RequestHandler,
  createTripItem: (async (req, res) => { ok(res, await service.createTripItem(req.user!.id, id(req), getValidated<CreateTripItemInput>(req, "body")), undefined, 201); }) satisfies RequestHandler,
  updateTripItem: (async (req, res) => { ok(res, await service.updateTripItem(req.user!.id, id(req), itemId(req), getValidated<PatchTripItemInput>(req, "body"))); }) satisfies RequestHandler,
  deleteTripItem: (async (req, res) => { ok(res, await service.deleteTripItem(req.user!.id, id(req), itemId(req))); }) satisfies RequestHandler,
  listTrips: (async (req, res) => { ok(res, await service.listTrips(req.user!.id)); }) satisfies RequestHandler,
  getTrip: (async (req, res) => { ok(res, await service.getTrip(req.user!.id, id(req))); }) satisfies RequestHandler,
  createTrip: (async (req, res) => { ok(res, await service.createTrip(req.user!.id, getValidated<CreateTripInput>(req, "body")), undefined, 201); }) satisfies RequestHandler,
  updateTrip: (async (req, res) => { ok(res, await service.updateTrip(req.user!.id, id(req), getValidated<PatchTripInput>(req, "body"))); }) satisfies RequestHandler,
  deleteTrip: (async (req, res) => { ok(res, await service.deleteTrip(req.user!.id, id(req))); }) satisfies RequestHandler,
};
