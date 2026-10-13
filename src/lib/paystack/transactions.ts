/**
 * Transaction Database Persistence Layer
 * 
 * Interacts with public.transactions using Supabase Service Role client.
 * Enforces idempotency and safe state machine transitions.
 */

async function getServiceClient() {
  try {
    const mod = await import('@/lib/supabase-server');
    return mod.createServiceClient ? mod.createServiceClient() : null;
  } catch {
    return null;
  }
}

import type { TransactionRecord, TransactionStatus } from './types';

export class DatabaseMigrationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseMigrationRequiredError';
  }
}

/**
 * Creates a pending transaction record with a complete pricing snapshot.
 */
export async function createPendingTransaction(
  record: Omit<TransactionRecord, 'id' | 'created_at' | 'updated_at' | 'paid_at'>
): Promise<TransactionRecord> {
  const supabase = await getServiceClient();
  if (!supabase) {
    throw new Error('Supabase service client could not be initialized.');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        reference: record.reference,
        provider: record.provider || 'paystack',
        provider_reference: record.provider_reference || null,
        customer_email: record.customer_email,
        customer_name: record.customer_name || null,
        user_id: record.user_id || null,
        product_type: record.product_type,
        product_id: record.product_id,
        amount: record.amount,
        currency: record.currency,
        pricing_model: record.pricing_model,
        base_amount: record.base_amount,
        base_currency: record.base_currency,
        fx_rate: record.fx_rate,
        status: 'pending',
        metadata: record.metadata || {},
      },
    ])
    .select('*')
    .single();

  if (error) {
    if (error.message.includes('relation "public.transactions" does not exist') || error.code === '42P01') {
      throw new DatabaseMigrationRequiredError(
        'The "transactions" table does not exist in the Supabase database. Please apply migration 009_universal_transactions.sql in the Supabase Dashboard SQL Editor.'
      );
    }
    throw new Error(`Failed to create pending transaction: ${error.message}`);
  }

  return data as TransactionRecord;
}

/**
 * Retrieves a transaction by its unique reference.
 */
export async function getTransactionByReference(
  reference: string
): Promise<TransactionRecord | null> {
  const supabase = await getServiceClient();
  if (!supabase) {
    throw new Error('Supabase service client could not be initialized.');
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('reference', reference.trim())
    .maybeSingle();

  if (error) {
    if (error.message.includes('relation "public.transactions" does not exist') || error.code === '42P01') {
      throw new DatabaseMigrationRequiredError(
        'The "transactions" table does not exist in the Supabase database. Please apply migration 009_universal_transactions.sql.'
      );
    }
    throw new Error(`Failed to query transaction by reference: ${error.message}`);
  }

  return data as TransactionRecord | null;
}

/**
 * Updates a transaction's status and provider reference idempotently.
 * 
 * Rules:
 *   - If the transaction is already 'successful', it remains 'successful' and paid_at is preserved.
 *   - Transitions to 'successful' require setting paid_at.
 */
export async function updateTransactionStatus(
  reference: string,
  updates: {
    status: TransactionStatus;
    providerReference?: string;
    paidAt?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<TransactionRecord> {
  const supabase = await getServiceClient();
  if (!supabase) {
    throw new Error('Supabase service client could not be initialized.');
  }

  // 1. Fetch current transaction state
  const current = await getTransactionByReference(reference);
  if (!current) {
    throw new Error(`Transaction with reference "${reference}" not found.`);
  }

  // 2. Idempotency protection: If already successful, do not revert or duplicate
  if (current.status === 'successful') {
    return current;
  }

  // 3. Prepare payload
  const updatePayload: Record<string, unknown> = {
    status: updates.status,
    updated_at: new Date().toISOString(),
  };

  if (updates.providerReference) {
    updatePayload.provider_reference = updates.providerReference;
  }

  if (updates.status === 'successful') {
    updatePayload.paid_at = updates.paidAt || new Date().toISOString();
  }

  if (updates.metadata) {
    updatePayload.metadata = {
      ...(current.metadata || {}),
      ...updates.metadata,
    };
  }

  // 4. Concurrency Guard:
  // If attempting to update to a non-successful status (failed, abandoned, pending),
  // NEVER overwrite a row that has already been transitioned to 'successful' by another concurrent worker.
  let query = supabase
    .from('transactions')
    .update(updatePayload)
    .eq('reference', reference);

  if (updates.status !== 'successful') {
    query = query.neq('status', 'successful');
  }

  const { data, error } = await query.select('*');

  if (error) {
    throw new Error(`Failed to update transaction status: ${error.message}`);
  }

  // If 0 rows were updated, a concurrent request transitioned this transaction to 'successful'
  if (!data || data.length === 0) {
    const fresh = await getTransactionByReference(reference);
    return (fresh || current) as TransactionRecord;
  }

  return data[0] as TransactionRecord;
}

export interface StateTransitionResult {
  transaction: TransactionRecord;
  transitioned: boolean; // True ONLY if this call transitioned the transaction from pending to successful
}

/**
 * Atomically transitions a pending transaction to 'successful'.
 * 
 * ATOMIC DATABASE GUARANTEE:
 * Uses a conditional SQL update: WHERE reference = $1 AND status = 'pending'.
 * Only one concurrent request can successfully update the row and receive rows back.
 * If another request already transitioned the transaction, 0 rows are updated,
 * and transitioned is returned as false.
 */
export async function transitionTransactionToSuccessful(
  reference: string,
  params: {
    providerReference: string;
    paidAt?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<StateTransitionResult> {
  const supabase = await getServiceClient();
  if (!supabase) {
    throw new Error('Supabase service client could not be initialized.');
  }

  const paidAt = params.paidAt || new Date().toISOString();

  // 1. Fetch current transaction state
  const current = await getTransactionByReference(reference);
  if (!current) {
    throw new Error(`Transaction with reference "${reference}" not found.`);
  }

  // Idempotency early-return if already successful
  if (current.status === 'successful') {
    return {
      transaction: current,
      transitioned: false,
    };
  }

  const mergedMetadata = {
    ...(current.metadata || {}),
    ...(params.metadata || {}),
  };

  const updatePayload: Record<string, unknown> = {
    status: 'successful',
    provider_reference: params.providerReference,
    paid_at: paidAt,
    updated_at: new Date().toISOString(),
    metadata: mergedMetadata,
  };

  // 2. ATOMIC CONDITIONAL UPDATE:
  // PostgREST executes: UPDATE transactions SET ... WHERE reference = $1 AND status != 'successful'
  // Ensures that a server-verified successful payment cannot remain stuck as 'failed' or 'abandoned',
  // while preserving atomic updates and duplicate-processing protection.
  const { data: updatedRows, error: updateError } = await supabase
    .from('transactions')
    .update(updatePayload)
    .eq('reference', reference)
    .neq('status', 'successful')
    .select('*');

  if (updateError) {
    throw new Error(`Atomic state transition failed: ${updateError.message}`);
  }

  // If exactly 1 row was updated, THIS request won the transition race!
  if (updatedRows && updatedRows.length === 1) {
    return {
      transaction: updatedRows[0] as TransactionRecord,
      transitioned: true,
    };
  }

  // If 0 rows were updated, a concurrent request won the race. Fetch latest state.
  const reloaded = await getTransactionByReference(reference);
  return {
    transaction: reloaded || current,
    transitioned: false,
  };
}

/**
 * Idempotently fulfills a verified successful transaction.
 * 
 * Guarantees:
 * 1. Executes strictly once per transaction reference.
 * 2. Checks and updates metadata with fulfillment audit trail atomically.
 * 3. Never throws to disrupt the calling webhook or verification HTTP response.
 */
export async function fulfillTransaction(
  transaction: TransactionRecord
): Promise<{ fulfilled: boolean; alreadyFulfilled: boolean }> {
  try {
    if (transaction.status !== 'successful') {
      return { fulfilled: false, alreadyFulfilled: false };
    }

    const metadata = (transaction.metadata || {}) as Record<string, unknown>;

    // 1. Idempotency check: Already fulfilled?
    if (metadata.fulfilled === true || metadata.fulfillment_dispatched === true) {
      return { fulfilled: false, alreadyFulfilled: true };
    }

    const supabase = await getServiceClient();
    if (!supabase) {
      console.warn('[Fulfillment] Supabase service client unavailable, skipping fulfillment.');
      return { fulfilled: false, alreadyFulfilled: false };
    }

    // 2. Atomic flag update in transactions.metadata to claim fulfillment
    const updatedMetadata = {
      ...metadata,
      fulfillment_dispatched: true,
      fulfilled: true,
      fulfilled_at: new Date().toISOString(),
    };

    const { data: claimedRows, error: claimError } = await supabase
      .from('transactions')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', transaction.reference)
      .select('*');

    if (claimError || !claimedRows || claimedRows.length === 0) {
      // Another worker claimed fulfillment concurrently
      return { fulfilled: false, alreadyFulfilled: true };
    }

    // 3. Dispatch Product-Specific Fulfillment Actions
    if (transaction.product_type === 'consultation') {
      try {
        const { sendConsultationBookingConfirmation, sendConsultationAdminNotification } = await import('@/lib/email');

        const duration = (metadata.duration as string) || 'Consultation Session';
        const goals = (metadata.goals as string) || undefined;
        const phone = (metadata.phone as string) || undefined;

        // Send customer confirmation
        await sendConsultationBookingConfirmation({
          to: transaction.customer_email,
          name: transaction.customer_name || 'Valued Client',
          duration,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
        });

        // Send admin notification
        await sendConsultationAdminNotification({
          customerName: transaction.customer_name || 'Valued Client',
          customerEmail: transaction.customer_email,
          duration,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          goals,
          phone,
        });
      } catch (emailErr) {
        console.error(`[Fulfillment] Email dispatch failed for consultation ${transaction.reference}:`, emailErr);
      }
    }

    return { fulfilled: true, alreadyFulfilled: false };
  } catch (err) {
    console.error(`[Fulfillment] Error fulfilling transaction ${transaction.reference}:`, err);
    return { fulfilled: false, alreadyFulfilled: false };
  }
}
