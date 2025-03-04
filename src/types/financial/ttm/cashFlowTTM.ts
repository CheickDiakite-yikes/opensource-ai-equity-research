
import { CashFlowStatement } from '../cashFlowTypes';

/**
 * TTM Cash Flow Statement
 */
export interface CashFlowStatementTTM extends Omit<CashFlowStatement, 'period'> {
  period: 'TTM';
}
