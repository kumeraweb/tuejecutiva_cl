import { notFound } from "next/navigation";
import OnboardingFormClient from "@/app/components/onboarding/OnboardingFormClient";
import {
  getCategoriesForOnboarding,
  getRegionsForOnboarding,
  getTokenByValue,
  isTokenValid,
} from "@/lib/onboarding";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function OnboardingTokenPage({ params }: PageProps) {
  const { token } = await params;
  const safeToken = decodeURIComponent(token).trim();

  const tokenRecord = await getTokenByValue(safeToken);
  if (!isTokenValid(tokenRecord)) {
    notFound();
  }

  const [categories, regions] = await Promise.all([
    getCategoriesForOnboarding(),
    getRegionsForOnboarding(),
  ]);

  return (
    <main className="bg-slate-50 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-3xl">
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
