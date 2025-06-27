-- Create coupon_codes table
CREATE TABLE IF NOT EXISTS public.coupon_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create coupon_code_usages table to track usage
CREATE TABLE IF NOT EXISTS public.coupon_code_usages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_code_id UUID NOT NULL REFERENCES public.coupon_codes(id) ON DELETE CASCADE,
    used_by_email VARCHAR(255) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coupon_code_id, used_by_email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON public.coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_expires_at ON public.coupon_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupon_code_usages_coupon_id ON public.coupon_code_usages(coupon_code_id);

-- Insert sample coupon code (LEVELUP2025)
INSERT INTO public.coupon_codes (code, max_uses, expires_at) 
VALUES ('LEVELUP2025', 80, '2025-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING; 