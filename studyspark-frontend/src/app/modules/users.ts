export type Role = 'student' | 'admin';

export interface User {
  id: number;
  fullname: string;
  email: string;
  role: Role;
  token?: string;
}
