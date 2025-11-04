export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  nit?: string; // NIT del usuario para uso en pedidos
}
