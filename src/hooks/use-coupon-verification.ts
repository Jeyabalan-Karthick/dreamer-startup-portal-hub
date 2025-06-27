import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CouponVerificationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  couponData: {
    code: string;
    maxUses: number;
    currentUses: number;
    expiresAt: string;
    isActive: boolean;
  } | null;
}

export const useCouponVerification = () => {
  const [verificationState, setVerificationState] = useState<CouponVerificationResult>({
    isValid: false,
    isLoading: false,
    error: null,
    couponData: null,
  });

  const verifyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) {
      setVerificationState({
        isValid: false,
        isLoading: false,
        error: null,
        couponData: null,
      });
      return;
    }

    setVerificationState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get coupon details - use .maybeSingle() instead of .single() to handle no results gracefully
      const { data: couponData, error: couponError } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .maybeSingle();

      if (couponError) {
        console.error('Error fetching coupon:', couponError);
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'Error verifying coupon code',
          couponData: null,
        });
        return;
      }

      if (!couponData) {
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'Invalid coupon code',
          couponData: null,
        });
        return;
      }

      // Check if coupon is active
      if (!couponData.is_active) {
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'This coupon code is inactive',
          couponData: null,
        });
        return;
      }

      // Check if coupon has expired
      const now = new Date();
      const expiresAt = new Date(couponData.expires_at);
      if (now > expiresAt) {
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'This coupon code has expired',
          couponData: null,
        });
        return;
      }

      // Get current usage count
      const { data: usageData, error: usageError } = await supabase
        .from('coupon_code_usages')
        .select('*')
        .eq('coupon_code_id', couponData.id);

      if (usageError) {
        console.error('Error fetching usage data:', usageError);
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'Error verifying coupon usage',
          couponData: null,
        });
        return;
      }

      const currentUses = usageData?.length || 0;

      // Check if coupon has reached max uses
      if (currentUses >= couponData.max_uses) {
        setVerificationState({
          isValid: false,
          isLoading: false,
          error: 'This coupon code has reached its maximum usage limit',
          couponData: null,
        });
        return;
      }

      // Coupon is valid!
      setVerificationState({
        isValid: true,
        isLoading: false,
        error: null,
        couponData: {
          code: couponData.code,
          maxUses: couponData.max_uses,
          currentUses,
          expiresAt: couponData.expires_at,
          isActive: couponData.is_active,
        },
      });

    } catch (error) {
      console.error('Error verifying coupon:', error);
      setVerificationState({
        isValid: false,
        isLoading: false,
        error: 'An unexpected error occurred',
        couponData: null,
      });
    }
  }, []);

  const resetVerification = useCallback(() => {
    setVerificationState({
      isValid: false,
      isLoading: false,
      error: null,
      couponData: null,
    });
  }, []);

  return {
    ...verificationState,
    verifyCoupon,
    resetVerification,
  };
}; 