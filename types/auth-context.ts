// In your types file (e.g., types.ts or auth-context.ts)
export type AppUser = {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  // Add any other user properties you need
};