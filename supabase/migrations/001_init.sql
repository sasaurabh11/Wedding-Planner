CREATE TABLE wedding_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  city TEXT NOT NULL,
  venue_type TEXT NOT NULL CHECK (venue_type IN ('banquet_hall', 'farmhouse', 'destination', 'garden', 'hotel', 'other')),
  budget_bracket TEXT NOT NULL,
  priority_one TEXT NOT NULL,
  priority_two TEXT NOT NULL,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  vendor_category TEXT NOT NULL,
  priority_rank INTEGER NOT NULL,
  suggested_budget_inr INTEGER NOT NULL,
  rationale TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  vendor_category TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  amount_paid INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES wedding_intakes(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_intake_id ON ai_recommendations(intake_id);
CREATE INDEX idx_payments_intake_id ON payments(intake_id);
CREATE INDEX idx_chat_messages_intake_id ON chat_messages(intake_id);
