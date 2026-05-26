import { IntakeForm } from "@/components/intake/IntakeForm";

export const metadata = {
  title: "Plan Your Wedding — Wedding Planner AI",
  description: "Tell us about your wedding and we'll create a personalized vendor budget plan.",
};

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-[#FDFAF5] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-4xl">💍</span>
          <h1 className="font-playfair text-4xl font-bold text-[#1C1917] mt-3 mb-2">
            Your Dream Wedding Starts Here
          </h1>
          <p className="text-gray-500 text-lg">
            Answer a few questions and our AI will craft a personalized vendor plan for you
          </p>
        </div>
        <IntakeForm />
      </div>
    </main>
  );
}
