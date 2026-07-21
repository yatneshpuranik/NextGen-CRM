export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}
