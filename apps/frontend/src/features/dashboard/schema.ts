export interface DestinationTotals {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface FacilityTotals {
  total: number;
  published: number;
  pending: number;
  draft: number;
}

export interface UserTotals {
  total: number;
  wisatawan: number;
  merchant: number;
  admin: number;
  newThisMonth: number;
}

export interface MerchantTotals {
  total: number;
  newThisMonth: number;
}

export interface UserGrowthPoint {
  month: string;
  label: string;
  newUsers: number;
  totalUsers: number;
}

export interface CategoryDistributionItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface PopularDestination {
  id: string;
  name: string;
  province: string | null;
  regency: string | null;
  image: string | null;
  planCount: number;
}

export interface RecentDestination {
  id: string;
  name: string;
  province: string | null;
  regency: string | null;
  image: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    destinations: DestinationTotals;
    facilities: FacilityTotals;
    users: UserTotals;
    merchants: MerchantTotals;
  };
  userGrowth: UserGrowthPoint[];
  categoryDistribution: CategoryDistributionItem[];
  popularDestinations: PopularDestination[];
  recentDestinations: RecentDestination[];
}
