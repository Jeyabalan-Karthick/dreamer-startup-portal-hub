import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useCouponVerification } from '@/hooks/use-coupon-verification';
import { cn } from '@/lib/utils';

interface CouponInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  value,
  onChange,
  onValidationChange,
  label = "Coupon Code",
  placeholder = "Enter coupon code",
  required = false,
  className,
  disabled = false,
}) => {
  const { isValid, isLoading, error, couponData, verifyCoupon, resetVerification } = useCouponVerification();
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce the input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Verify coupon when debounced value changes
  useEffect(() => {
    if (debouncedValue.trim()) {
      verifyCoupon(debouncedValue);
    } else {
      resetVerification();
    }
  }, [debouncedValue, verifyCoupon, resetVerification]);

  // Notify parent component of validation status
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const getInputBorderColor = () => {
    if (isLoading) return 'border-gray-300';
    if (isValid) return 'border-green-500 focus:border-green-600';
    if (error) return 'border-red-500 focus:border-red-600';
    return 'border-gray-300 focus:border-gray-500';
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
    }
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (error) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (isLoading) return null;
    if (isValid && couponData) {
      return (
        <div className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Valid coupon! 
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="coupon-code" className="text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="coupon-code"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "pr-10 transition-colors duration-200",
            getInputBorderColor()
          )}
          autoComplete="off"
        />
        
        {/* Status Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {/* Status Message */}
      {getStatusMessage() && (
        <div className="mt-1">
          {getStatusMessage()}
        </div>
      )}

      {/* Coupon Details (when valid) */}
      {isValid && couponData && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm text-green-800">
            <div className="font-medium">Coupon Details:</div>
            <div className="mt-1 space-y-1">
              <div>• Code: <span className="font-mono">{couponData.code}</span></div>
              {/* <div>• Uses: {couponData.currentUses} of {couponData.maxUses}</div> */}
              <div>• Expires: {new Date(couponData.expiresAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 