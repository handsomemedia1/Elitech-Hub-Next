// ============================================================
// Before Cybersecurity — Entitlements & Product Access
// A signed-in user with an active entitlement has paid access. Entitlements
// are independent of the user's global role.
// ============================================================

import { createServiceClient } from '@/lib/supabase-server';

const PRODUCT_SLUG = 'before-cybersecurity';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface EntitlementCheckResult {
  hasAccess: boolean;
  reason: 'entitled' | 'admin_grant' | 'no_entitlement' | 'unauthenticated' | 'db_unavailable';
  grantedAt?: string;
  productVersion?: string;
}

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

async function getProduct(supabase: ServiceClient) {
  const { data } = await supabase
    .from('bc_products')
    .select('id, current_version')
    .eq('slug', PRODUCT_SLUG)
    .single();
  return data as { id: string; current_version: string | null } | null;
}

/**
 * Finds a successful Before Cybersecurity payment made with this user's email.
 * Guests can pay before they have an account; when they later sign in with the
 * same email, this lets their purchase unlock access automatically.
 */
async function findPaidTransactionForUser(supabase: ServiceClient, userId: string) {
  const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
  const email = (user?.email || '').trim();
  if (!email) return null;

  const { data: tx } = await supabase
    .from('transactions')
    .select('reference')
    .eq('product_id', PRODUCT_SLUG)
    .eq('status', 'successful')
    .ilike('customer_email', email)
    .order('paid_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (tx?.reference as string | undefined) || null;
}

/**
 * Server-side check for a user's Before Cybersecurity access.
 */
export async function checkUserEntitlement(
  userId: string | null | undefined,
  userRole?: string
): Promise<EntitlementCheckResult> {
  if (!userId) {
    return { hasAccess: false, reason: 'unauthenticated' };
  }

  // Administrators have preview and auditing access.
  if (userRole === 'admin') {
    return { hasAccess: true, reason: 'admin_grant', productVersion: '1.0' };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return { hasAccess: false, reason: 'db_unavailable' };
  }

  try {
    const product = await getProduct(supabase);
    if (!product) {
      console.error('[Before-Cybersecurity] bc_products has no "before-cybersecurity" row. Has the migration been run?');
      return { hasAccess: false, reason: 'db_unavailable' };
    }

    const { data: entitlement } = await supabase
      .from('bc_entitlements')
      .select('id, status, product_version, granted_at')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .eq('status', 'active')
      .maybeSingle();

    if (entitlement) {
      return {
        hasAccess: true,
        reason: 'entitled',
        grantedAt: entitlement.granted_at,
        productVersion: entitlement.product_version || product.current_version || '1.0',
      };
    }

    // No entitlement yet: a paid guest checkout with the same email still counts.
    const reference = await findPaidTransactionForUser(supabase, userId);
    if (reference) {
      const granted = await grantProductEntitlement({ userId, orderId: reference });
      if (granted.success) {
        return { hasAccess: true, reason: 'entitled', productVersion: product.current_version || '1.0' };
      }
      console.error('[Before-Cybersecurity] Paid transaction found but entitlement grant failed:', granted.error);
    }

    return { hasAccess: false, reason: 'no_entitlement' };
  } catch (err) {
    console.error('[Before-Cybersecurity Entitlement Check Error]:', err);
    return { hasAccess: false, reason: 'db_unavailable' };
  }
}

/**
 * Grants product access after a verified payment.
 * `orderId` may be a bc_orders UUID or a payment reference such as a Paystack
 * reference; references are stored in `payment_reference`, because `order_id`
 * is a UUID foreign key and would reject them.
 */
export async function grantProductEntitlement(params: {
  userId: string;
  orderId?: string;
  productSlug?: string;
}): Promise<{ success: boolean; entitlementId?: string; error?: string }> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { success: false, error: 'Database service client unavailable' };
  }

  try {
    const slug = params.productSlug || PRODUCT_SLUG;
    const { data: product, error: prodErr } = await supabase
      .from('bc_products')
      .select('id, current_version')
      .eq('slug', slug)
      .single();

    if (prodErr || !product) {
      return { success: false, error: 'Product not found in bc_products' };
    }

    const isUuid = !!params.orderId && UUID_RE.test(params.orderId);
    const now = new Date().toISOString();
    const { data: entitlement, error: entErr } = await supabase
      .from('bc_entitlements')
      .upsert(
        {
          user_id: params.userId,
          product_id: product.id,
          order_id: isUuid ? params.orderId : null,
          payment_reference: isUuid ? null : params.orderId || null,
          product_version: product.current_version || '1.0',
          status: 'active',
          granted_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id,product_id' }
      )
      .select('id')
      .single();

    if (entErr) {
      return { success: false, error: entErr.message };
    }

    return { success: true, entitlementId: entitlement?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}
