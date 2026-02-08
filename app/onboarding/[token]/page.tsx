import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import OnboardingFormClient from "@/app/components/onboarding/OnboardingFormClient";
import {
  getCategoriesForOnboarding,
  getRegionsForOnboarding,
  getTokenByValue,
  isTokenValid,
} from "@/lib/onboarding";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function OnboardingTokenPage({ params }: PageProps) {
  noStore();

  const { token } = await params;
  const safeToken = decodeURIComponent(token).trim();

  const tokenRecord = await getTokenByValue(safeToken);
  if (!tokenRecord || tokenRecord.used_at !== null || !isTokenValid(tokenRecord)) {
    notFound();
  }

  const [categories, regions] = await Promise.all([
    getCategoriesForOnboarding(),
    getRegionsForOnboarding(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <OnboardingFormClient
          categories={categories}
          regions={regions}
          token={safeToken}
          mode="token"
        />
      </div>
    </main>
  );
}
