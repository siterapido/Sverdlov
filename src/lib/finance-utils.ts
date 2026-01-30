import { addMonths, isBefore, startOfMonth } from "date-fns";

export function calculateFinancialStatus(
    plan: { amount: number, frequency: string, start_date: Date },
    payments: { amount: number, reference_date: Date }[]
): 'up_to_date' | 'late' {
    if (plan.frequency !== 'monthly') {
        // Only monthly supported for MVP logic check
        return 'up_to_date'; 
    }

    const today = new Date();
    // Start checking from the month of start_date
    let checkDate = startOfMonth(new Date(plan.start_date));
    const currentMonth = startOfMonth(today);
    
    // Check each month from start_date until the month before current month
    // (Assuming current month payment can be made until end of month? Or strict?)
    // Let's assume strict: if we are in March, Feb must be paid. March is "open" or "late" depending on rule.
    // Let's say we check up to last month to define "late". Current month pending is not "late" yet?
    // Or simpler: check until current month if strict.
    
    // Logic: Iterate months from start_date up to (but not including) current month.
    // If any of these past months is missing payment -> Late.
    
    while (isBefore(checkDate, currentMonth)) {
        // Check if there is a payment for this reference date (month/year)
        const payment = payments.find(p => {
            const ref = new Date(p.reference_date);
            // Use UTC matching or simple month/year match to avoid timezone issues
            return ref.getMonth() === checkDate.getMonth() && ref.getFullYear() === checkDate.getFullYear();
        });

        // Basic check: paid at least the plan amount? (Partial payments not handled yet)
        if (!payment || payment.amount < plan.amount) {
            return 'late';
        }

        checkDate = addMonths(checkDate, 1);
    }

    return 'up_to_date';
}
