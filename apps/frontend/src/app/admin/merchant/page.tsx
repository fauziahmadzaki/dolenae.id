import UsersPage from "~/features/users/users-page";

export const metadata = { title: "Merchant — Admin Dolenae.id" };

export default function AdminMerchantsPage() {
  return <UsersPage merchantOnly />;
}
