export type Role = "mahasiswa" | "dosen" | "super_admin";

export interface UserProfile {
  name: string;
  identifier: string; // NIM, NIDN, or NIP
  identifierType: "NIM" | "NIDN" | "NIP";
  roleLabel: string;
  initials: string;
  email: string;
  programStudi?: string;
  fakultas?: string;
}

export interface NavItem {
  name: string;
  href: string;
  iconName: string;
  badge?: string | number;
}

export interface NavCategory {
  category: string;
  items: NavItem[];
}
