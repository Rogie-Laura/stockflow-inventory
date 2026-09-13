import type { SupabaseClient } from "@supabase/supabase-js";
import { TABLES } from "@/lib/db-tables";
import type { PosTerminal, Store, StoreMember, StoreRole } from "@/types/store";

export interface StoreContextData {
  store: Store;
  role: StoreRole;
  memberId: string;
  terminals: PosTerminal[];
  members: StoreMember[];
  displayName: string;
}

export async function fetchStoreContext(
  supabase: SupabaseClient,
  userId: string,
  userEmail?: string,
  userMetaName?: string
): Promise<StoreContextData | null> {
  const { data: membership, error: memberError } = await supabase
    .from(TABLES.storeMember)
    .select(`id, store_id, user_id, role, ${TABLES.store}(id, name, owner_id, created_at, pos_pin)`)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) return null;

  const storeRaw = membership[TABLES.store];
  const storeRow = (Array.isArray(storeRaw) ? storeRaw[0] : storeRaw) as {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
    pos_pin: string | null;
  };

  if (!storeRow) return null;

  const store: Store = {
    id: storeRow.id,
    name: storeRow.name,
    ownerId: storeRow.owner_id,
    createdAt: storeRow.created_at,
    hasPosPin: Boolean(storeRow.pos_pin),
  };

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
    })),
    members: memberList,
    displayName: userMetaName || userEmail?.split("@")[0] || "Cashier",
  };
}
