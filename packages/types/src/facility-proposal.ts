import type { ID, ISODateString } from "./common";
import type { TravelSupportType } from "./travel-support";

export type ProposalStatus = "menunggu" | "terverifikasi" | "ditolak";

export interface FacilityProposal {
  id: ID;
  name: string;
  supportType: TravelSupportType;
  nearestDestinationName: string;
  address: string;
  note?: string;
  status: ProposalStatus;
  createdAt: ISODateString;
}
