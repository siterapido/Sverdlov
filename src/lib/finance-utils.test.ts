import { expect, test, describe } from 'vitest';
import { calculateFinancialStatus } from './finance-utils';
import { subMonths } from 'date-fns';

describe('calculateFinancialStatus', () => {
    const amount = 50;
    const frequency = 'monthly';
    
    test('should return up_to_date if start date is this month', () => {
        const status = calculateFinancialStatus(
            { amount, frequency, start_date: new Date() },
            []
        );
        expect(status).toBe('up_to_date');
    });

    test('should return late if start date was 2 months ago and no payments', () => {
        const start_date = subMonths(new Date(), 2);
        const status = calculateFinancialStatus(
            { amount, frequency, start_date },
            []
        );
        expect(status).toBe('late');
    });

    test('should return up_to_date if start date was 2 months ago and all past months paid', () => {
        const start_date = subMonths(new Date(), 2);
        const lastMonth = subMonths(new Date(), 1);
        const twoMonthsAgo = subMonths(new Date(), 2);

        const payments = [
            { amount: 50, reference_date: lastMonth },
            { amount: 50, reference_date: twoMonthsAgo }
        ];

        const status = calculateFinancialStatus(
            { amount, frequency, start_date },
            payments
        );
        expect(status).toBe('up_to_date');
    });

    test('should return late if one month missing', () => {
        const start_date = subMonths(new Date(), 3);
        const lastMonth = subMonths(new Date(), 1);
        // Missing 2 months ago
        const threeMonthsAgo = subMonths(new Date(), 3);

        const payments = [
            { amount: 50, reference_date: lastMonth },
            { amount: 50, reference_date: threeMonthsAgo }
        ];

        const status = calculateFinancialStatus(
            { amount, frequency, start_date },
            payments
        );
        expect(status).toBe('late');
    });
});
