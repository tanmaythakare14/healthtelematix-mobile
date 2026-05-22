import { API_BASE_URL } from '@/config/environment';
import { logger } from '@/utils/logger';
import type { CarePlanDTO } from '../@types';

function getAuthToken(): string {
  return localStorage.getItem('auth_token') ?? '';
}

export async function listCarePlans(patientId: string): Promise<CarePlanDTO[]> {
  const url = new URL(`${API_BASE_URL}/patients/${patientId}/care-plans`);

  logger.info('Fetching care plans', { patientId });

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    throw new Error('Failed to load care plans');
  }

  return res.json() as Promise<CarePlanDTO[]>;
}
