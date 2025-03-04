
import { IncomeStatement } from '../incomeStatementTypes';

/**
 * TTM Income Statement
 */
export interface IncomeStatementTTM extends Omit<IncomeStatement, 'period'> {
  period: 'TTM';
}
