import { Timestamp } from 'firebase/firestore';

export interface Account {
  id: string;
  gmail: string;
  password: string;
  twoFactor?: string;
  status: 'Ok' | 'Pending';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  uid: string;
  username: string;
  role: 'admin' | 'member';
  email: string;
}

export interface AppState {
  user: UserProfile | null;
  accounts: Account[];
  loading: boolean;
  isAuthReady: boolean;
}
