
export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong';
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return emailRegex.test(email.toLowerCase());
};

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let score: number;
  let label: 'Weak' | 'Medium' | 'Strong';
  let color: string;

  if (metRequirements < 3) {
    score = 1;
    label = 'Weak';
    color = '#ef4444'; // red
  } else if (metRequirements < 5) {
    score = 2;
    label = 'Medium';
    color = '#f59e0b'; // orange
  } else {
    score = 3;
    label = 'Strong';
    color = '#10b981'; // green
  }

  return { score, label, color, requirements };
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  const strength = checkPasswordStrength(password);
  
  if (!strength.requirements.length) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!strength.requirements.uppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!strength.requirements.lowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!strength.requirements.number) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!strength.requirements.special) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password meets all requirements' };
};
