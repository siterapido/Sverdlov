/**
 * Asaas Payment Gateway Integration
 *
 * This module provides utilities to integrate with the Asaas payment gateway.
 * Documentation: https://docs.asaas.com/
 *
 * Required environment variables:
 * - ASAAS_API_KEY: Your Asaas API key
 * - ASAAS_SANDBOX: Set to 'true' for sandbox mode, 'false' for production
 */

const ASAAS_BASE_URL = process.env.ASAAS_SANDBOX === 'false'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

interface AsaasCustomer {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    cpfCnpj: string;
    address: {
        street: string;
        number: string;
        complement?: string;
        district: string;
        city: string;
        state: string;
        postalCode: string;
    };
}

interface AsaasPayment {
    customerId: string;
    billingType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX' | 'UNDEFINED';
    value: number;
    dueDate: string; // YYYY-MM-DD format
    description?: string;
    externalReference?: string;
    installmentCount?: number;
}

interface AsaasSubscription {
    customerId: string;
    billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX' | 'UNDEFINED';
    value: number;
    nextDueDate: string; // YYYY-MM-DD format
    cycle: 'MONTHLY' | 'BIWEEKLY' | 'BIMONTHLY' | 'SEMIANNUAL' | 'ANNUAL';
    description?: string;
}

interface AsaasResponse {
    id: string;
    status?: string;
    value?: number;
    dueDate?: string;
    invoiceUrl?: string;
    cycle?: string;
}

/**
 * Helper function to make API requests to Asaas
 */
async function asaasRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
): Promise<T> {
    const url = `${ASAAS_BASE_URL}${endpoint}`;

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY,
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Asaas API Error: ${error.errors?.[0]?.description || error.message}`);
    }

    return response.json();
}

/**
 * Create a new customer in Asaas
 */
export async function createAsaasCustomer(customer: AsaasCustomer) {
    try {
        const response = await asaasRequest('POST', '/customers', {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            cpfCnpj: customer.cpfCnpj.replace(/\D/g, ''),
            address: customer.address.street,
            addressNumber: customer.address.number,
            complement: customer.address.complement,
            province: customer.address.district,
            city: customer.address.city,
            state: customer.address.state,
            postalCode: customer.address.postalCode.replace(/\D/g, ''),
        });

        const responseData = response as AsaasResponse;
        return { success: true, customerId: responseData.id };
    } catch (error) {
        console.error('Error creating Asaas customer:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create customer',
        };
    }
}

/**
 * Get customer details from Asaas
 */
export async function getAsaasCustomer(customerId: string) {
    try {
        const response = await asaasRequest('GET', `/customers/${customerId}`);
        return { success: true, customer: response };
    } catch (error) {
        console.error('Error fetching Asaas customer:', error);
        return { success: false, error: 'Failed to fetch customer' };
    }
}

/**
 * Create a payment in Asaas
 */
export async function createAsaasPayment(payment: AsaasPayment) {
    try {
        const response = await asaasRequest('POST', '/payments', {
            customerId: payment.customerId,
            billingType: payment.billingType,
            value: payment.value,
            dueDate: payment.dueDate,
            description: payment.description || 'Payment',
            externalReference: payment.externalReference,
            installmentCount: payment.installmentCount || 1,
        });

        const responseData = response as AsaasResponse;
        return { success: true, paymentId: responseData.id, invoiceUrl: responseData.invoiceUrl };
    } catch (error) {
        console.error('Error creating Asaas payment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create payment',
        };
    }
}

/**
 * Create a subscription in Asaas
 */
export async function createAsaasSubscription(subscription: AsaasSubscription) {
    try {
        const response = await asaasRequest('POST', '/subscriptions', {
            customerId: subscription.customerId,
            billingType: subscription.billingType,
            value: subscription.value,
            nextDueDate: subscription.nextDueDate,
            cycle: subscription.cycle,
            description: subscription.description || 'Subscription',
        });

        const responseData = response as AsaasResponse;
        return { success: true, subscriptionId: responseData.id };
    } catch (error) {
        console.error('Error creating Asaas subscription:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create subscription',
        };
    }
}

/**
 * Get payment details from Asaas
 */
export async function getAsaasPayment(paymentId: string) {
    try {
        const responseData = await asaasRequest('GET', `/payments/${paymentId}`);
        const payment = responseData as any;
        return {
            success: true,
            payment: {
                id: payment.id,
                status: payment.status,
                value: payment.value,
                dueDate: payment.dueDate,
                paidDate: payment.paidDate,
            },
        };
    } catch (error) {
        console.error('Error fetching Asaas payment:', error);
        return { success: false, error: 'Failed to fetch payment' };
    }
}

/**
 * Cancel a subscription in Asaas
 */
export async function cancelAsaasSubscription(subscriptionId: string) {
    try {
        await asaasRequest<any>('DELETE', `/subscriptions/${subscriptionId}`);
        return { success: true };
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return { success: false, error: 'Failed to cancel subscription' };
    }
}

/**
 * Webhook handler for Asaas events
 * Call this function when receiving webhook payloads from Asaas
 */
export async function handleAsaasWebhook(event: any) {
    try {
        const { event: eventType, payment, subscription } = event;

        switch (eventType) {
            case 'PAYMENT_CONFIRMED':
                // Handle confirmed payment
                console.log('Payment confirmed:', payment.id);
                return { success: true, action: 'payment_confirmed' };

            case 'PAYMENT_RECEIVED':
                // Handle received payment
                console.log('Payment received:', payment.id);
                return { success: true, action: 'payment_received' };

            case 'PAYMENT_OVERDUE':
                // Handle overdue payment
                console.log('Payment overdue:', payment.id);
                return { success: true, action: 'payment_overdue' };

            case 'SUBSCRIPTION_CREATED':
                // Handle subscription creation
                console.log('Subscription created:', subscription.id);
                return { success: true, action: 'subscription_created' };

            case 'SUBSCRIPTION_UPDATED':
                // Handle subscription update
                console.log('Subscription updated:', subscription.id);
                return { success: true, action: 'subscription_updated' };

            default:
                console.log('Unknown event:', eventType);
                return { success: true, action: 'unknown_event' };
        }
    } catch (error) {
        console.error('Error handling webhook:', error);
        return { success: false, error: 'Failed to handle webhook' };
    }
}
