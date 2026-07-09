-- FitsMe Database Schema
-- Phase 1: Authentication foundation only.
-- Later phases will add: measurements, catalog_items, outfits, wishlists, etc.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Measurements table (Phase 2)
CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    height_cm NUMERIC,
    front_image_path TEXT,
    side_image_path TEXT,
    shoulder_width_cm NUMERIC,
    chest_cm NUMERIC,
    waist_cm NUMERIC,
    hip_cm NUMERIC,
    arm_length_cm NUMERIC,
    leg_length_cm NUMERIC,
    body_shape VARCHAR(64),
    confidence_score NUMERIC,
    raw_landmarks JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_user ON measurements (user_id);
