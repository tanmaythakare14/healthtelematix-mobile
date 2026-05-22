import { API_BASE_URL } from '@/config/environment';
import { logger } from '@/utils/logger';
import type { SignInCredentials, SignInResponseDTO } from '../@types';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleHttpError(status: number): never {
  if (status === 401) {
    throw new ApiError('Invalid email or password. Please try again.', status);
  }
  if (status === 403) {
    throw new ApiError('Your account does not have access. Contact your administrator.', status);
  }
  if (status === 429) {
    throw new ApiError('Too many attempts. Please wait a few minutes and try again.', status);
  }
  if (status >= 500) {
    throw new ApiError('Something went wrong. Please try again later.', status);
  }
  throw new ApiError('Request failed. Please try again.', status);
}

export async function signIn(credentials: SignInCredentials): Promise<SignInResponseDTO> {
  logger.info('Sign in attempt', { email: credentials.email });

  // Mock response for development — replace with real API call
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 800));
    if (credentials.email === 'admin@clinic.com' && credentials.password === 'TempPass@123') {
      return {
        token: 'mock-jwt-token-clinic-admin',
        user: {
          id: 'usr_001',
          email: credentials.email,
          role: 'CLINIC_ADMIN',
          clinicId: 'clinic_001',
          fullName: 'Sarah Mitchell',
          mustSetPassword: true,
        },
      };
    }
    throw new ApiError('Invalid email or password. Please try again.', 401);
  }

  const res = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    handleHttpError(res.status);
  }

  return res.json() as Promise<SignInResponseDTO>;
}
