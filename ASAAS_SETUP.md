# Asaas Integration Setup Guide

This guide explains how to set up and use the Asaas payment gateway integration in the Sverdlov platform.

## Prerequisites

1. Create an Asaas account at https://www.asaas.com/
2. Get your API key from the Asaas dashboard (Settings > Integrações > API)
3. Configure environment variables

## Environment Variables

Add the following to your `.env.local` file:

```env
# Asaas Configuration
ASAAS_API_KEY=your_api_key_here
ASAAS_SANDBOX=true  # Set to false for production
ASAAS_WEBHOOK_SECRET=your_webhook_secret  # Optional, for signature verification
```

## Implementation Steps

### 1. Customer Creation

When a member signs up or is approved, create a corresponding Asaas customer:

```typescript
import { createAsaasCustomer } from '@/lib/integrations/asaas';

await createAsaasCustomer({
    name: member.fullName,
    email: member.email,
    phone: member.phone,
    cpfCnpj: member.cpf,
    address: {
        street: member.street,
        number: member.number,
        complement: member.complement,
        district: member.neighborhood,
        city: member.city,
        state: member.state,
        postalCode: member.zipCode,
    },
});
```

### 2. Create Subscriptions

For monthly contributions, create a recurring subscription:

```typescript
import { createAsaasSubscription } from '@/lib/integrations/asaas';

await createAsaasSubscription({
    customerId: asaasCustomerId,
    billingType: 'PIX',  // or CREDIT_CARD, BOLETO
    value: plan.amount,
    nextDueDate: '2024-02-01',
    cycle: 'MONTHLY',  // or BIWEEKLY, BIMONTHLY, etc.
    description: `${plan.name} - Contribuição Mensal`,
});
```

### 3. Create One-Time Payments

For donations or additional payments:

```typescript
import { createAsaasPayment } from '@/lib/integrations/asaas';

await createAsaasPayment({
    customerId: asaasCustomerId,
    billingType: 'PIX',
    value: 150.00,
    dueDate: '2024-02-15',
    description: 'Doação Extraordinária',
    externalReference: memberId,  // Link back to member
});
```

### 4. Webhook Configuration

1. In the Asaas dashboard, go to Settings > Integrações > Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/asaas`
3. Enable the following events:
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE
   - SUBSCRIPTION_CREATED
   - SUBSCRIPTION_UPDATED

The webhook handler will automatically update payment statuses in the database.

### 5. Integration Points

#### Create Member Flow
- When member status changes to "active", create Asaas customer
- Store Asaas customer ID in members table
- Create subscription if member has a plan

#### Finance Dashboard
- Use Asaas API to fetch recent transactions
- Display payment status from Asaas
- Show subscription next due dates

#### Delinquency Management
- Query Asaas for overdue payments
- Send reminders when Asaas marks payment as overdue
- Process partial payments through Asaas

## API Reference

### createAsaasCustomer(customer)
Creates a new customer in Asaas and returns customer ID.

**Parameters:**
- `customer`: AsaasCustomer object with name, email, phone, cpfCnpj, and address

**Returns:** `{ success: boolean, customerId?: string, error?: string }`

### createAsaasPayment(payment)
Creates a one-time payment.

**Parameters:**
- `payment`: AsaasPayment object with customerId, billingType, value, dueDate

**Returns:** `{ success: boolean, paymentId?: string, invoiceUrl?: string, error?: string }`

### createAsaasSubscription(subscription)
Creates a recurring subscription.

**Parameters:**
- `subscription`: AsaasSubscription object with customerId, billingType, value, cycle

**Returns:** `{ success: boolean, subscriptionId?: string, error?: string }`

### getAsaasPayment(paymentId)
Retrieves payment details from Asaas.

**Returns:** `{ success: boolean, payment?: { id, status, value, dueDate, paidDate }, error?: string }`

## Testing in Sandbox Mode

1. Ensure `ASAAS_SANDBOX=true` in your environment variables
2. Use test CPF: `11144477735`
3. Create test customers and payments
4. In Asaas dashboard, you can simulate payment confirmations

## Webhook Events Handled

- **PAYMENT_CONFIRMED**: Updates payment status to completed
- **PAYMENT_RECEIVED**: Confirms payment reception
- **PAYMENT_OVERDUE**: Marks payment as pending if overdue
- **SUBSCRIPTION_CREATED**: Creates new subscription
- **SUBSCRIPTION_UPDATED**: Updates subscription

## Error Handling

All functions return `{ success: boolean, error?: string }` format. Always check the `success` field before accessing other properties.

```typescript
const result = await createAsaasPayment(paymentData);
if (!result.success) {
    console.error('Failed to create payment:', result.error);
    // Handle error
} else {
    console.log('Payment created:', result.paymentId);
}
```

## Testing Checklist

- [ ] Environment variables configured correctly
- [ ] Sandbox API key works
- [ ] Can create customers
- [ ] Can create payments
- [ ] Can create subscriptions
- [ ] Webhook receives events correctly
- [ ] Payment status updates in database
- [ ] Tested with test CPF in sandbox
- [ ] All error cases handled

## Production Deployment

When ready for production:

1. Get production API key from Asaas
2. Update `ASAAS_SANDBOX=false`
3. Update webhook URL in Asaas dashboard to production domain
4. Test end-to-end with real customers
5. Monitor webhook deliveries in Asaas dashboard
6. Set up error alerting for failed payments

## Support

For issues with Asaas integration:
- Asaas API Documentation: https://docs.asaas.com/
- Asaas Support: https://www.asaas.com/suporte

For issues with Sverdlov:
- Check API logs for webhook processing errors
- Review database records for payment synchronization
- Verify environment variables are set correctly
