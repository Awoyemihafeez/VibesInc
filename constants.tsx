import { LayoutDashboard, List, Settings } from 'lucide-react';
import React from 'react';

export const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export const NAV_ITEMS = [
  { id: 'DASHBOARD', icon: <LayoutDashboard size={24} />, label: 'Overview' },
  { id: 'TRANSACTIONS', icon: <List size={24} />, label: 'Transactions' },
  { id: 'SETTINGS', icon: <Settings size={24} />, label: 'Settings' },
];

export const CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Utilities',
  'Housing',
  'Shopping',
  'Entertainment',
  'Health',
  'Income',
  'Transfer',
  'Other'
];

export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { code: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
  { code: 'GHS', symbol: '₵', label: 'Ghanaian Cedi' },
  { code: 'AED', symbol: 'dh', label: 'UAE Dirham' },
];

export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

export const SAMPLE_DATA_SEED = [
  { id: '1', date: '2023-10-01', merchant: 'Coffee Shop', amount: 5.50, category: 'Food & Drink', type: 'EXPENSE' },
  { id: '2', date: '2023-10-02', merchant: 'Salary', amount: 3200.00, category: 'Income', type: 'INCOME' },
  { id: '3', date: '2023-10-03', merchant: 'Uber', amount: 24.00, category: 'Transport', type: 'EXPENSE' },
];