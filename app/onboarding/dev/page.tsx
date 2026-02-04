import OnboardingFormClient from "@/app/components/onboarding/OnboardingFormClient";
import {
  getCategoriesForOnboarding,
  getOrCreateDevToken,
  getRegionsForOnboarding,
} from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingDevPage() {
  const devToken = await getOrCreateDevToken();
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
          mode="dev"
          token={devToken.token}
        />
      </div>
    </main>
  );
}
