import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { finances, members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleAsaasWebhook } from '@/lib/integrations/asaas';

/**
 * Webhook handler for Asaas events
 * This endpoint receives payment and subscription events from Asaas
 */
export async function POST(request: NextRequest) {
    try {
        const event = await request.json();

        // Verify webhook signature (optional but recommended)
        // For now, we'll just process the event

        const result = await handleAsaasWebhook(event);

        // Update database based on event type
        if (event.event === 'PAYMENT_RECEIVED' && event.payment) {
            // Find finance record by external reference or create new one
            const externalRef = event.payment.externalReference;

            if (externalRef) {
                // Try to find and update existing payment
                const existing = await db
                    .select()
                    .from(finances)
                    .where(eq(finances.transactionId, event.payment.id));

                if (existing.length > 0) {
                    await db
                        .update(finances)
                        .set({
                            status: 'completed',
                            paymentDate: new Date(event.payment.confirmedDate),
                        })
                        .where(eq(finances.transactionId, event.payment.id));
                }
            }
        }

        if (event.event === 'PAYMENT_OVERDUE' && event.payment) {
            // Update payment status to pending if overdue
            const existing = await db
                .select()
                .from(finances)
                .where(eq(finances.transactionId, event.payment.id));

            if (existing.length > 0) {
                await db
                    .update(finances)
                    .set({ status: 'pending' })
                    .where(eq(finances.transactionId, event.payment.id));
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully',
            event: result,
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook' },
            { status: 500 }
        );
    }
}
