
import { BalanceSheet } from '../balanceSheetTypes';

/**
 * TTM Balance Sheet
 */
export interface BalanceSheetTTM extends Omit<BalanceSheet, 'period'> {
  period: 'TTM';
}
