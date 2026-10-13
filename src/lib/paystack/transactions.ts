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
 * Idempotently fulfills a verified successful consultation.
 *
 * A conditional database update claims the row before sending mail, so concurrent
 * webhook/callback requests cannot both dispatch the same fulfillment. Delivery
 * checkpoints are persisted after each confirmed email to reduce duplicate sends
 * when the second email fails and the operation is retried.
 */
export async function fulfillTransaction(
  transaction: TransactionRecord
): Promise<{ fulfilled: boolean; alreadyFulfilled: boolean }> {
  if (transaction.status !== 'successful') {
    return { fulfilled: false, alreadyFulfilled: false };
  }

  if (transaction.product_type !== 'consultation') {
    console.warn(
      `[Fulfillment] No automatic fulfillment handler is configured for product type "${transaction.product_type}" (reference ${transaction.reference}).`
    );
    return { fulfilled: false, alreadyFulfilled: false };
  }

  const supabase = await getServiceClient();
  if (!supabase) {
    console.error('[Fulfillment] Supabase service client unavailable; fulfillment was not claimed.');
    return { fulfilled: false, alreadyFulfilled: false };
  }

  let workingMetadata = {
    ...((transaction.metadata || {}) as Record<string, unknown>),
  };

  if (workingMetadata.fulfilled === true || workingMetadata.fulfillment_dispatched === true) {
    return { fulfilled: false, alreadyFulfilled: true };
  }

  try {
    // Atomic conditional claim: only one concurrent caller can win.
    workingMetadata = {
      ...workingMetadata,
      fulfillment_claimed: true,
      fulfillment_claimed_at: new Date().toISOString(),
    };

    const { data: claimedRows, error: claimError } = await supabase
      .from('transactions')
      .update({
        metadata: workingMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('reference', transaction.reference)
      .eq('status', 'successful')
      .not('metadata->>fulfilled', 'eq', 'true')
      .not('metadata->>fulfillment_dispatched', 'eq', 'true')
      .not('metadata->>fulfillment_claimed', 'eq', 'true')
      .select('*');

    if (claimError) throw new Error(`Could not claim fulfillment: ${claimError.message}`);

    if (!claimedRows || claimedRows.length === 0) {
      const fresh = await getTransactionByReference(transaction.reference);
      const freshMetadata = (fresh?.metadata || {}) as Record<string, unknown>;
      return {
        fulfilled: false,
        alreadyFulfilled:
          freshMetadata.fulfilled === true ||
          freshMetadata.fulfillment_dispatched === true ||
          freshMetadata.fulfillment_claimed === true,
      };
    }

    workingMetadata = { ...((claimedRows[0].metadata || {}) as Record<string, unknown>) };

    const persistCheckpoint = async (patch: Record<string, unknown>) => {
      workingMetadata = { ...workingMetadata, ...patch };
      const { data, error } = await supabase
        .from('transactions')
        .update({ metadata: workingMetadata, updated_at: new Date().toISOString() })
        .eq('reference', transaction.reference)
        .contains('metadata', { fulfillment_claimed: true })
        .select('reference');

      if (error || !data || data.length === 0) {
        throw new Error(error?.message || 'Lost fulfillment claim while saving delivery progress.');
      }
    };

    const { sendConsultationBookingConfirmation, sendConsultationAdminNotification } =
      await import('@/lib/email');
    const duration = (workingMetadata.duration as string) || 'Consultation Session';
    const goals = (workingMetadata.goals as string) || undefined;
    const phone = (workingMetadata.phone as string) || undefined;

    if (workingMetadata.customer_confirmation_sent !== true) {
      await sendConsultationBookingConfirmation({
        to: transaction.customer_email,
        name: transaction.customer_name || 'Valued Client',
        duration,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
      });
      await persistCheckpoint({ customer_confirmation_sent: true });
    }

    if (workingMetadata.admin_notification_sent !== true) {
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
      await persistCheckpoint({ admin_notification_sent: true });
    }

    workingMetadata = {
      ...workingMetadata,
      fulfillment_claimed: false,
      fulfilled: true,
      fulfillment_dispatched: true,
      fulfilled_at: new Date().toISOString(),
      fulfillment_last_error: null,
    };

    const { data: completedRows, error: completionError } = await supabase
      .from('transactions')
      .update({ metadata: workingMetadata, updated_at: new Date().toISOString() })
      .eq('reference', transaction.reference)
      .contains('metadata', { fulfillment_claimed: true })
      .select('reference');

    if (completionError || !completedRows || completedRows.length === 0) {
      throw new Error(completionError?.message || 'Could not finalize fulfillment state.');
    }

    return { fulfilled: true, alreadyFulfilled: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fulfillment error';
    console.error(`[Fulfillment] Failed for ${transaction.reference}:`, err);

    // Release the claim so a later verified callback/webhook can retry.
    // Confirmed per-email checkpoints remain in metadata to avoid repeat sends.
    try {
      workingMetadata = {
        ...workingMetadata,
        fulfillment_claimed: false,
        fulfillment_last_error: message.slice(0, 500),
        fulfillment_last_attempt_at: new Date().toISOString(),
      };
      await supabase
        .from('transactions')
        .update({ metadata: workingMetadata, updated_at: new Date().toISOString() })
        .eq('reference', transaction.reference)
        .contains('metadata', { fulfillment_claimed: true });
    } catch (releaseError) {
      console.error(`[Fulfillment] Could not release claim for ${transaction.reference}:`, releaseError);
    }

    return { fulfilled: false, alreadyFulfilled: false };
  }
}
