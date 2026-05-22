import type { SignInResponseDTO } from '../@types';
import type { AuthUser } from '@/store/slices/authSlice';

export function signInResponseToAuthUser(dto: SignInResponseDTO): AuthUser {
  return {
    id: dto.user.id,
    email: dto.user.email,
    role: dto.user.role,
    clinicId: dto.user.clinicId,
    fullName: dto.user.fullName,
    mustSetPassword: dto.user.mustSetPassword,
  };
}
