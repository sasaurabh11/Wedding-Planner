"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepIndicator } from "@/components/intake/StepIndicator";
import { Step1WeddingDetails } from "@/components/intake/Step1WeddingDetails";
import { Step2Venue } from "@/components/intake/Step2Venue";
import { Step3Budget } from "@/components/intake/Step3Budget";
import { Step4Priorities } from "@/components/intake/Step4Priorities";
import { Button } from "@/components/ui/button";
import { isFutureDate } from "@/lib/utils";

const STEP_LABELS = ["Details", "Venue", "Budget", "Priorities"];

interface FormData {
  weddingDate: string;
  guestCount: number | "";
  city: string;
  venueType: string;
  budgetBracket: string;
  priorityOne: string;
  priorityTwo: string;
}

const INITIAL_FORM: FormData = {
  weddingDate: "",
  guestCount: "",
  city: "",
  venueType: "",
  budgetBracket: "",
  priorityOne: "",
  priorityTwo: "",
};

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.weddingDate) {
        newErrors.weddingDate = "Please select a wedding date";
      } else if (!isFutureDate(form.weddingDate)) {
        newErrors.weddingDate = "Wedding date must be in the future";
      }
      if (form.guestCount === "" || form.guestCount === undefined) {
        newErrors.guestCount = "Please enter the number of guests";
      } else if (
        typeof form.guestCount === "number" &&
        (form.guestCount < 10 || form.guestCount > 2000)
      ) {
        newErrors.guestCount = "Guest count must be between 10 and 2,000";
      }
    }

    if (step === 2) {
      if (!form.city.trim()) {
        newErrors.city = "Please enter your wedding city";
      } else if (form.city.trim().length < 2) {
        newErrors.city = "City name must be at least 2 characters";
      }
      if (!form.venueType) {
        newErrors.venueType = "Please select a venue type";
      }
    }

    if (step === 3) {
      if (!form.budgetBracket) {
        newErrors.budgetBracket = "Please select a budget range";
      }
    }

    if (step === 4) {
      if (!form.priorityOne || !form.priorityTwo) {
        newErrors.priorities = "Please select exactly 2 priorities";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingDate: form.weddingDate,
          guestCount: form.guestCount,
          city: form.city.trim(),
          venueType: form.venueType,
          budgetBracket: form.budgetBracket,
          priorityOne: form.priorityOne,
          priorityTwo: form.priorityTwo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recommendations");
      }

      router.push(`/recommendations/${data.intakeId}`);
    } catch (err) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  if (submitting) {
    return (
      <div className="fixed inset-0 bg-ivory/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">💍</span>
          </div>
          <div>
            <h3 className="font-playfair text-2xl font-bold text-charcoal">
              Crafting your personalized plan...
            </h3>
            <p className="text-gray-500 mt-2">
              Our AI is analyzing your preferences and creating tailored recommendations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8">
        <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {step === 1 && (
          <Step1WeddingDetails
            weddingDate={form.weddingDate}
            guestCount={form.guestCount}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {step === 2 && (
          <Step2Venue
            city={form.city}
            venueType={form.venueType}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {step === 3 && (
          <Step3Budget
            budgetBracket={form.budgetBracket}
            errors={errors}
            onChange={handleChange}
          />
        )}
        {step === 4 && (
          <Step4Priorities
            priorityOne={form.priorityOne}
            priorityTwo={form.priorityTwo}
            errors={errors}
            onChange={handleChange}
          />
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              Generate My Plan ✨
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Step {step} of 4 · Your data is private and never shared
      </p>
    </div>
  );
}
