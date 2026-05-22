export type UserType = 'PHYSICIAN' | 'NURSE' | 'DHN';
export type UserStatus = 'Active' | 'Pending' | 'Deactivated';
export type AddedBy = 'superadmin' | 'you';

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  npiNumber?: string;
  specialty?: string;
  type: UserType;
  status: UserStatus;
  addedBy: AddedBy;
}

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  npiNumber: string;
  specialty: string;
  type: UserType;
  status: UserStatus;
  addedBy: AddedBy;
  deactivatedOn?: string;
}

export interface UserDetailData {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  npiNumber: string;
  specialty: string;
  type: UserType;
  status: UserStatus;
  addedBy: AddedBy;
  deactivatedOn?: string;
}

export type NamePrefix = 'MD' | 'MBBS' | 'DO' | 'DDS' | 'PhD' | 'NP' | 'PA' | 'RN';

export interface AddUserFormValues {
  prefix: NamePrefix;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  npiNumber: string;
  type: UserType;
}
