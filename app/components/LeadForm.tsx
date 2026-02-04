import { getCategories } from "@/lib/queries";
import LeadFormClient from "./LeadFormClient";

export default async function LeadForm() {
  const categories = await getCategories();

  return <LeadFormClient categories={categories} />;
}
