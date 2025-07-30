-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('software-engineer', 'devops', 'sre', 'manager', 'founder', 'other');
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-1000', '1000+');
CREATE TYPE log_level AS ENUM ('trace', 'debug', 'info', 'warn', 'error', 'fatal');
CREATE TYPE incident_status AS ENUM ('triggered', 'acknowledged', 'resolved');
CREATE TYPE incident_severity AS ENUM ('p1', 'p2', 'p3', 'p4');
CREATE TYPE monitor_type AS ENUM ('http', 'ping', 'tcp', 'ssl', 'keyword');
CREATE TYPE monitor_status AS ENUM ('up', 'down', 'paused', 'maintenance');
CREATE TYPE timeline_type AS ENUM ('created', 'acknowledged', 'resolved', 'comment', 'status_change', 'assignment_change', 'severity_change', 'notification_sent');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL,
    company_size company_size NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE public.logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    level log_level NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    user_id TEXT,
    session_id TEXT,
    trace_id TEXT,
    span_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents table
CREATE TABLE public.incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status incident_status NOT NULL DEFAULT 'triggered',
    severity incident_severity NOT NULL,
    source TEXT NOT NULL,
    assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Incident timeline table
CREATE TABLE public.incident_timeline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    type timeline_type NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Monitors table
CREATE TABLE public.monitors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type monitor_type NOT NULL,
    url TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    status monitor_status NOT NULL DEFAULT 'paused',
    last_check TIMESTAMP WITH TIME ZONE,
    next_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (for Stripe integration)
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    plan TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX idx_logs_level ON public.logs(level);
CREATE INDEX idx_logs_source ON public.logs(source);
CREATE INDEX idx_logs_user_id ON public.logs(user_id);
CREATE INDEX idx_logs_trace_id ON public.logs(trace_id);
CREATE INDEX idx_logs_created_at ON public.logs(created_at DESC);

CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_assignee_id ON public.incidents(assignee_id);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at DESC);

CREATE INDEX idx_incident_timeline_incident_id ON public.incident_timeline(incident_id);
CREATE INDEX idx_incident_timeline_timestamp ON public.incident_timeline(timestamp DESC);

CREATE INDEX idx_monitors_status ON public.monitors(status);
CREATE INDEX idx_monitors_type ON public.monitors(type);
CREATE INDEX idx_monitors_next_check ON public.monitors(next_check);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON public.monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
