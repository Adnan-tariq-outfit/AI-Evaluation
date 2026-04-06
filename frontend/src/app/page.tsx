import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import FeaturedModels from "@/components/FeaturedModels";
import BuilderFeatures from "@/components/BuilderFeature";
import BrowseByLab from "@/components/BrowswByLab";
import ModelComparison from "@/components/ModuleComparison";
import TrendingThisWeek from "@/components/TrendingThisWeak";
import FindModelsByBudget from "@/components/FindModelsByBudget";
import QuickStartByUseCase from "@/components/QuickStartByUseCase";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col theme-page">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedModels />
        <BuilderFeatures />
        <BrowseByLab />
        <ModelComparison />
        <TrendingThisWeek />
        <FindModelsByBudget />
        <QuickStartByUseCase />
      </main>
      <Footer />
    </div>
  );
}
