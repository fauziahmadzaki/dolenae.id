import type { Request } from "express";
import { getValidated } from "../middleware/validate";
import { operationsService as service } from "../services/operations.service";
import { ok } from "../utils/response";
import type { RequestHandler } from "express";
import type { PaginationQuery } from "../utils/pagination";
import type { CreatePayment, PaymentQuery, SimulatePayment, CreatePromo, UpdatePromo, ActivityQuery, CreateProposal, ProposalQuery, ReviewProposal, CreateSupport, SupportQuery, UpdateSupport } from "./operations.schema";

const id = (req: Request) => getValidated<{ id: string }>(req, "params").id;
export const operationsController = {
  createPayment: (async (req, res) => ok(res, await service.createPayment(getValidated<CreatePayment>(req, "body"), req.user!.id), undefined, 201)) as RequestHandler,
  getPayment: (async (req, res) => ok(res, await service.getPayment(id(req), req.user!.id, req.user!.role === "admin"))) as RequestHandler,
  minePayments: (async (req, res) => ok(res, await service.minePayments(req.user!.id))) as RequestHandler,
  listPayments: (async (req, res) => { const result = await service.listPayments(getValidated<PaymentQuery>(req, "query")); return ok(res, result.items, result.meta); }) as RequestHandler,
  simulatePayment: (async (req, res) => ok(res, await service.simulatePayment(id(req), getValidated<SimulatePayment>(req, "body").status, req.user!.id, req.user!.role === "admin"), undefined, 201)) as RequestHandler,
  createPromo: (async (req, res) => ok(res, await service.createPromo(getValidated<CreatePromo>(req, "body"), req.user!.id), undefined, 201)) as RequestHandler,
  activePromos: (async (_req, res) => ok(res, await service.activePromos())) as RequestHandler,
  listPromos: (async (req, res) => { const result = await service.listPromos(getValidated<PaginationQuery>(req, "query")); return ok(res, result.items, result.meta); }) as RequestHandler,
  updatePromo: (async (req, res) => ok(res, await service.updatePromo(id(req), getValidated<UpdatePromo>(req, "body"), req.user!.id))) as RequestHandler,
  deletePromo: (async (req, res) => ok(res, await service.deletePromo(id(req), req.user!.id))) as RequestHandler,
  createProposal: (async (req, res) => ok(res, await service.createProposal(getValidated<CreateProposal>(req, "body"), req.user!.id), undefined, 201)) as RequestHandler,
  mineProposals: (async (req, res) => ok(res, await service.mineProposals(req.user!.id))) as RequestHandler,
  listProposals: (async (req, res) => { const result = await service.listProposals(getValidated<ProposalQuery>(req, "query")); return ok(res, result.items, result.meta); }) as RequestHandler,
  reviewProposal: (async (req, res) => ok(res, await service.reviewProposal(id(req), getValidated<ReviewProposal>(req, "body"), req.user!.id))) as RequestHandler,
  metrics: (async (_req, res) => ok(res, await service.metrics())) as RequestHandler,
  activity: (async (req, res) => { const result = await service.activity(getValidated<ActivityQuery>(req, "query")); return ok(res, result.items, result.meta); }) as RequestHandler,
  merchants: (async (req, res) => { const result = await service.merchants(getValidated<PaginationQuery>(req, "query")); return ok(res, result.items, result.meta); }) as RequestHandler,
  publicSupports: (async (req, res) => { const result = await service.listSupports(getValidated<SupportQuery>(req, "query"), true); return ok(res, result.items, result.meta); }) as RequestHandler,
  adminSupports: (async (req, res) => { const result = await service.listSupports(getValidated<SupportQuery>(req, "query"), false); return ok(res, result.items, result.meta); }) as RequestHandler,
  getSupport: (async (req, res) => ok(res, await service.getSupport(id(req)))) as RequestHandler,
  createSupport: (async (req, res) => ok(res, await service.createSupport(getValidated<CreateSupport>(req, "body"), req.user!.id), undefined, 201)) as RequestHandler,
  updateSupport: (async (req, res) => ok(res, await service.updateSupport(id(req), getValidated<UpdateSupport>(req, "body"), req.user!.id))) as RequestHandler,
  deleteSupport: (async (req, res) => ok(res, await service.deleteSupport(id(req), req.user!.id))) as RequestHandler,
};
