-- ==============================================================================
-- FounderLink Demo Data SQL for Testing Messaging Feature
-- ==============================================================================
-- Foreign Key Column Naming in TypeORM (without explicit @JoinColumn name):
-- - profiles: "userId"
-- - startup_ideas: "ownerId"
-- - cofounder_requirements: "startupIdeaId"
-- Foreign Key Column Naming (with explicit @JoinColumn name):
-- - applications: "requirement_id", "candidate_id"
-- - messages: "application_id", "sender_id"
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USERS
-- ------------------------------------------------------------------------------
INSERT INTO "users" (
  "id", 
  "full_name", 
  "email", 
  "password", 
  "system_role", 
  "status", 
  "created_at", 
  "updated_at"
) VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-111111111111', 
  'Alice Founder', 
  'alice@founderlink.com', 
  '$2b$10$EpRnTzVlqHNP0.111111111111111111111111111111111111111', 
  'user', 
  'active', 
  NOW(), 
  NOW()
),
(
  'a1b2c3d4-e5f6-7890-abcd-222222222222', 
  'Bob Developer', 
  'bob@founderlink.com', 
  '$2b$10$EpRnTzVlqHNP0.222222222222222222222222222222222222222', 
  'user', 
  'active', 
  NOW(), 
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. PROFILES (Uses camelCase "userId")
-- ------------------------------------------------------------------------------
INSERT INTO "profiles" (
  "id", 
  "userId", 
  "bio", 
  "role", 
  "skills", 
  "interested_industries", 
  "available_weekly_commitment", 
  "location", 
  "created_at", 
  "updated_at"
) VALUES 
(
  'c1b2c3d4-e5f6-7890-abcd-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'Passionate startup founder building AI solutions.',
  'product',
  ARRAY['Product Management', 'AI/ML', 'Strategy'],
  ARRAY['HealthTech', 'Artificial Intelligence'],
  20,
  'San Francisco, CA',
  NOW(),
  NOW()
),
(
  'c1b2c3d4-e5f6-7890-abcd-222222222222',
  'a1b2c3d4-e5f6-7890-abcd-222222222222',
  'Full-stack engineer with expertise in NestJS, React, and PostgreSQL.',
  'technical',
  ARRAY['TypeScript', 'NestJS', 'React', 'PostgreSQL'],
  ARRAY['HealthTech', 'SaaS'],
  30,
  'New York, NY',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. STARTUP IDEAS (Uses camelCase "ownerId")
-- ------------------------------------------------------------------------------
INSERT INTO "startup_ideas" (
  "id", 
  "ownerId", 
  "title", 
  "short_description", 
  "full_description", 
  "industries", 
  "startup_stage", 
  "status", 
  "created_at", 
  "updated_at"
) VALUES 
(
  's1b2c3d4-e5f6-7890-abcd-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'AI Health Assistant',
  'An AI-driven personal health monitoring platform for early symptom detection.',
  'We are building a comprehensive health platform leveraging LLMs and real-time biometric tracking to empower users with personalized medical insights.',
  ARRAY['HealthTech', 'Artificial Intelligence'],
  'mvp',
  'open',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. COFOUNDER REQUIREMENTS (Uses camelCase "startupIdeaId")
-- ------------------------------------------------------------------------------
INSERT INTO "cofounder_requirements" (
  "id", 
  "startupIdeaId", 
  "required_role", 
  "required_skills", 
  "required_weekly_commitment", 
  "equity_offered", 
  "status", 
  "created_at", 
  "updated_at"
) VALUES 
(
  'r1b2c3d4-e5f6-7890-abcd-111111111111',
  's1b2c3d4-e5f6-7890-abcd-111111111111',
  'technical',
  ARRAY['TypeScript', 'NestJS', 'PostgreSQL', 'WebSockets'],
  25,
  15.00,
  'open',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. APPLICATIONS (Uses explicit "requirement_id" and "candidate_id")
-- ------------------------------------------------------------------------------
INSERT INTO "applications" (
  "id", 
  "requirement_id", 
  "candidate_id", 
  "status", 
  "compatibility_score", 
  "created_at", 
  "updated_at"
) VALUES 
(
  'app11111-e5f6-7890-abcd-111111111111',
  'r1b2c3d4-e5f6-7890-abcd-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-222222222222',
  'accepted',
  92,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. MESSAGES (Uses explicit "application_id" and "sender_id")
-- ------------------------------------------------------------------------------
INSERT INTO "messages" (
  "id", 
  "application_id", 
  "sender_id", 
  "content", 
  "is_read", 
  "created_at"
) VALUES 
(
  'm1b2c3d4-e5f6-7890-abcd-111111111111',
  'app11111-e5f6-7890-abcd-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-222222222222', -- Candidate (Bob)
  'Hi Alice! I saw your requirement for AI Health Assistant and I am very interested in joining as Technical Co-founder.',
  true,
  NOW() - INTERVAL '1 hour'
),
(
  'm1b2c3d4-e5f6-7890-abcd-222222222222',
  'app11111-e5f6-7890-abcd-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-111111111111', -- Owner (Alice)
  'Welcome aboard Bob! Your background in NestJS and WebSockets looks perfect for our architecture.',
  false,
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
