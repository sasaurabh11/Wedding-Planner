export interface WeddingIntake {
  id: string;
  wedding_date: string;
  guest_count: number;
  city: string;
  venue_type: string;
  budget_bracket: string;
  priority_one: string;
  priority_two: string;
  ai_summary: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  intake_id: string;
  vendor_category: string;
  priority_rank: number;
  suggested_budget_inr: number;
  rationale: string;
  created_at: string;
}

export interface Payment {
  id: string;
  intake_id: string;
  vendor_category: string;
  vendor_name: string;
  amount_paid: number;
  payment_date: string;
  created_at: string;
}

export interface RecommendationResponse {
  intake: WeddingIntake;
  recommendations: Recommendation[];
  summary: string;
}

export interface IntakeFormData {
  weddingDate: string;
  guestCount: number;
  city: string;
  venueType: string;
  budgetBracket: string;
  priorityOne: string;
  priorityTwo: string;
}

export interface GeminiRecommendation {
  vendor_category: string;
  priority_rank: number;
  suggested_budget_inr: number;
  rationale: string;
}

export interface GeminiResponse {
  recommendations: GeminiRecommendation[];
  summary: string;
}

export interface RecommendApiResponse {
  intakeId: string;
  recommendations: Recommendation[];
  summary: string;
}

export interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

export interface StoredChatMessage {
  id: string;
  intake_id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
}
