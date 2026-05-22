export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3 && password.length >= 12) return 'strong';
  if (score >= 2 && password.length >= 8) return 'medium';
  return 'weak';
}
