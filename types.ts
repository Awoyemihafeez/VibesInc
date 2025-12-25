export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  subCategory?: string;
  type: TransactionType;
  flagged?: boolean;
  originalSource?: string;
  detectedCurrency?: string; // Track currency from the specific document
}

export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export interface Insight {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  SETTINGS = 'SETTINGS'
}

export interface UploadStatus {
  isUploading: boolean;
  message: string;
  error?: string;
}

export interface CategorizationRule {
  id: string;
  keyword: string;
  category: string;
  subCategory?: string;
}

export interface UserProfile {
  name: string;
  currency: string;
  avatar?: string;
}