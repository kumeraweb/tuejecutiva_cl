import Hero from "./components/Hero";
import CategoryPills from "./components/CategoryPills";
import HowItWorks from "./components/HowItWorks";
import VerificationBlock from "./components/VerificationBlock";
import ExecutiveCta from "./components/ExecutiveCta";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <CategoryPills />
        <HowItWorks />
        <VerificationBlock />
        <ExecutiveCta />
      </main>
    </>
  );
}
