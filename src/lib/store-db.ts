import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/lib/db-tables";
import { mapStoreRow } from "@/lib/store-settings";
import type { PosTerminal, Store, StoreMember, StoreRole } from "@/types/store";

export interface StoreContextData {
  store: Store;
  role: StoreRole;
  memberId: string;
  terminals: PosTerminal[];
  members: StoreMember[];
  displayName: string;
  accountNumber: string | null;
}

export async function fetchStoreContext(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string,
  userMetaName?: string
): Promise<StoreContextData | null> {
  const { data: membership, error: memberError } = await supabase
    .from(TABLES.storeMember)
    .select("id, store_id, user_id, role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) return null;

  const { data: storeRow, error: storeError } = await supabase
    .from(TABLES.store)
    .select(
      "id, name, owner_id, created_at, pos_pin, use_margin_pricing, pos_vat_enabled, pos_vat_percent",
    )
    .eq("id", membership.store_id)
    .single();

  if (storeError) throw storeError;
  if (!storeRow) return null;

  const store: Store = mapStoreRow(storeRow);

  const { data: profileRow } = await supabase
    .from(TABLES.profile)
    .select("account_number")
    .eq("id", userId)
    .maybeSingle();

  const [{ data: terminals }, { data: members }] = await Promise.all([
    supabase
      .from(TABLES.posTerminal)
      .select("*")
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("code"),
    supabase
      .from(TABLES.storeMember)
      .select("id, store_id, user_id, role")
      .eq("store_id", store.id)
      .order("created_at"),
  ]);

  const memberList: StoreMember[] = (members ?? []).map((m) => ({
    id: m.id,
    storeId: m.store_id,
    userId: m.user_id,
    role: m.role as StoreRole,
    email: m.user_id === userId ? userEmail : undefined,
    fullName: m.user_id === userId ? userMetaName : undefined,
  }));

  return {
    store,
    role: membership.role as StoreRole,
    memberId: membership.id,
    terminals: (terminals ?? []).map((t) => ({
      id: t.id,
      storeId: t.store_id,
      code: t.code,
      name: t.name,
      isActive: t.is_active,
      activeOperator: t.active_operator ?? null,
      activatedAt: t.activated_at ?? null,
    })),
    members: memberList,
    displayName: userMetaName || userEmail?.split("@")[0] || "Cashier",
    accountNumber: (profileRow?.account_number as string | null) ?? null,
  };
}
