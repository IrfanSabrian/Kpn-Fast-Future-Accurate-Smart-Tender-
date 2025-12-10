-- KPN FAST Database Schema
-- PostgreSQL Database for Document Automation System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (untuk autentikasi)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- admin, user
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: company_profile (Data Legalitas Perusahaan)
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_address TEXT,
    npwp VARCHAR(50),
    nib VARCHAR(50),
    akta_pendirian TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    director_name VARCHAR(255),
    director_position VARCHAR(100),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: personnel (Data Personel/Tenaga Ahli)
CREATE TABLE IF NOT EXISTS personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    education_level VARCHAR(100),
    major VARCHAR(100),
    university VARCHAR(255),
    graduation_year INTEGER,
    certification TEXT[], -- Array of certifications
    experience_years INTEGER,
    expertise TEXT[], -- Array of expertise areas
    phone VARCHAR(50),
    email VARCHAR(255),
    photo_url TEXT,
    cv_url TEXT,
    ijazah_url TEXT,
    sertifikat_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: projects (Data Proyek)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(100) UNIQUE NOT NULL,
    project_name VARCHAR(500) NOT NULL,
    client_name VARCHAR(255),
    client_agency VARCHAR(255),
    project_location TEXT,
    kak_file_url TEXT,
    hps_file_url TEXT,
    kak_text TEXT, -- Extracted text from KAK PDF
    hps_data JSONB, -- Parsed HPS/RAB data
    contract_value DECIMAL(15, 2),
    project_duration INTEGER, -- in days
    status VARCHAR(50) DEFAULT 'draft', -- draft, processing, completed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: generated_documents (Dokumen yang sudah digenerate)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- cover, spk, penawaran, ustek, cv, dll
    file_name VARCHAR(255),
    gdrive_file_id VARCHAR(255),
    gdrive_url TEXT,
    folder_number VARCHAR(10), -- 00, 01, 02, etc.
    is_ai_generated BOOLEAN DEFAULT false,
    generation_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    ai_prompt TEXT,
    ai_response TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: templates (Template untuk dokumen)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL, -- cover, spk, penawaran, dll
    gdrive_template_id VARCHAR(255),
    variables JSONB, -- Variables yang digunakan dalam template
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: ai_generations (Log untuk AI generation)
CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    generated_text TEXT,
    model_used VARCHAR(100) DEFAULT 'gemini-pro',
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    user_feedback TEXT,
    revision_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_projects_code ON projects(project_code);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_generated_documents_project ON generated_documents(project_id);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX idx_personnel_active ON personnel(is_active);
CREATE INDEX idx_ai_generations_project ON ai_generations(project_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profile_updated_at BEFORE UPDATE ON company_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON generated_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
