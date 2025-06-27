import { supabase } from '@/integrations/supabase/client';

export interface CouponUsageResult {
  success: boolean;
  error?: string;
  usageId?: string;
}

/**
 * Record coupon usage when a user registers
 */
export const recordCouponUsage = async (
  couponCode: string, 
  userEmail: string
): Promise<CouponUsageResult> => {
  try {
    // First, get the coupon details
    const { data: couponData, error: couponError } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .maybeSingle();

    if (couponError || !couponData) {
      return {
        success: false,
        error: 'Coupon not found'
      };
    }

    // Check if user has already used this coupon
    const { data: existingUsage, error: usageCheckError } = await supabase
      .from('coupon_code_usages')
      .select('*')
      .eq('coupon_code_id', couponData.id)
      .eq('used_by_email', userEmail)
      .maybeSingle();

    if (existingUsage) {
      return {
        success: false,
        error: 'You have already used this coupon code'
      };
    }

    // Record the usage
    const { data: usageData, error: insertError } = await supabase
      .from('coupon_code_usages')
      .insert({
        coupon_code_id: couponData.id,
        used_by_email: userEmail
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error recording coupon usage:', insertError);
      return {
        success: false,
        error: 'Failed to record coupon usage'
      };
    }

    return {
      success: true,
      usageId: usageData.id
    };

  } catch (error) {
    console.error('Error in recordCouponUsage:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

/**
 * Get coupon usage statistics
 */
export const getCouponUsageStats = async (couponCode: string) => {
  try {
    const { data: couponData, error: couponError } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .maybeSingle();

    if (couponError || !couponData) {
      return null;
    }

    const { data: usageData, error: usageError } = await supabase
      .from('coupon_code_usages')
      .select('*')
      .eq('coupon_code_id', couponData.id);

    if (usageError) {
      return null;
    }

    return {
      coupon: couponData,
      usageCount: usageData?.length || 0,
      remainingUses: Math.max(0, couponData.max_uses - (usageData?.length || 0))
    };

  } catch (error) {
    console.error('Error getting coupon usage stats:', error);
    return null;
  }
};

/**
 * Validate coupon code without recording usage
 */
export const validateCouponCode = async (couponCode: string) => {
  try {
    const { data: couponData, error: couponError } = await supabase
      .from('coupon_codes')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .maybeSingle();

    if (couponError || !couponData) {
      return { isValid: false, error: 'Invalid coupon code' };
    }

    // Check if coupon is active
    if (!couponData.is_active) {
      return { isValid: false, error: 'This coupon code is inactive' };
    }

    // Check if coupon has expired
    const now = new Date();
    const expiresAt = new Date(couponData.expires_at);
    if (now > expiresAt) {
      return { isValid: false, error: 'This coupon code has expired' };
    }

    // Get current usage count
    const { data: usageData, error: usageError } = await supabase
      .from('coupon_code_usages')
      .select('*')
      .eq('coupon_code_id', couponData.id);

    if (usageError) {
      return { isValid: false, error: 'Error checking coupon usage' };
    }

    const currentUses = usageData?.length || 0;

    // Check if coupon has reached max uses
    if (currentUses >= couponData.max_uses) {
      return { isValid: false, error: 'This coupon code has reached its maximum usage limit' };
    }

    return {
      isValid: true,
      couponData: {
        ...couponData,
        currentUses,
        remainingUses: couponData.max_uses - currentUses
      }
    };

  } catch (error) {
    console.error('Error validating coupon:', error);
    return { isValid: false, error: 'An unexpected error occurred' };
  }
}; 