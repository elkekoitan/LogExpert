-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other users (for assignments)" ON public.users
    FOR SELECT USING (true);

-- Logs table policies
CREATE POLICY "Users can view all logs" ON public.logs
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert logs" ON public.logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update logs" ON public.logs
    FOR UPDATE USING (true);

-- Incidents table policies
CREATE POLICY "Users can view all incidents" ON public.incidents
    FOR SELECT USING (true);

CREATE POLICY "Users can create incidents" ON public.incidents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update incidents" ON public.incidents
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete incidents they created or are assigned to" ON public.incidents
    FOR DELETE USING (
        assignee_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.incident_timeline 
            WHERE incident_id = incidents.id 
            AND user_id = auth.uid() 
            AND type = 'created'
        )
    );

-- Incident timeline policies
CREATE POLICY "Users can view incident timeline" ON public.incident_timeline
    FOR SELECT USING (true);

CREATE POLICY "Users can add timeline entries" ON public.incident_timeline
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own timeline entries" ON public.incident_timeline
    FOR UPDATE USING (user_id = auth.uid());

-- Monitors table policies
CREATE POLICY "Users can view all monitors" ON public.monitors
    FOR SELECT USING (true);

CREATE POLICY "Users can create monitors" ON public.monitors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update monitors" ON public.monitors
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete monitors" ON public.monitors
    FOR DELETE USING (true);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, role, company_size)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'other')::user_role,
        COALESCE(NEW.raw_user_meta_data->>'company_size', '1-10')::company_size
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    company_size TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role::TEXT,
        u.company_size::TEXT,
        u.avatar_url,
        u.created_at,
        u.updated_at
    FROM public.users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get incident with assignee details
CREATE OR REPLACE FUNCTION public.get_incidents_with_assignee()
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    severity TEXT,
    source TEXT,
    assignee_id UUID,
    assignee_first_name TEXT,
    assignee_last_name TEXT,
    assignee_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        i.status::TEXT,
        i.severity::TEXT,
        i.source,
        i.assignee_id,
        u.first_name,
        u.last_name,
        u.email,
        i.created_at,
        i.updated_at,
        i.resolved_at,
        i.metadata
    FROM public.incidents i
    LEFT JOIN public.users u ON i.assignee_id = u.id
    ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get incident timeline with user details
CREATE OR REPLACE FUNCTION public.get_incident_timeline(incident_id UUID)
RETURNS TABLE (
    id UUID,
    incident_id UUID,
    type TEXT,
    message TEXT,
    user_id UUID,
    user_first_name TEXT,
    user_last_name TEXT,
    user_email TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        it.id,
        it.incident_id,
        it.type::TEXT,
        it.message,
        it.user_id,
        u.first_name,
        u.last_name,
        u.email,
        it.timestamp,
        it.metadata
    FROM public.incident_timeline it
    LEFT JOIN public.users u ON it.user_id = u.id
    WHERE it.incident_id = get_incident_timeline.incident_id
    ORDER BY it.timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
