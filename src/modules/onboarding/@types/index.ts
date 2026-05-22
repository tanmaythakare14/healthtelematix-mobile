export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignInResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'CLINIC_ADMIN' | 'PHYSICIAN' | 'NURSE' | 'DHN';
    clinicId: string;
    fullName: string;
    mustSetPassword: boolean;
  };
}

export interface SignInFormValues {
  email: string;
  password: string;
}
