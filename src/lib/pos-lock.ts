const POS_LOCK_KEY = "pinoystock_pos_locked";
const POS_LOCK_STORE_KEY = "pinoystock_pos_locked_store";

export function isPosLocked(storeId: string): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(POS_LOCK_KEY) === "true" &&
    localStorage.getItem(POS_LOCK_STORE_KEY) === storeId
  );
}

export function setPosLocked(storeId: string) {
  localStorage.setItem(POS_LOCK_KEY, "true");
  localStorage.setItem(POS_LOCK_STORE_KEY, storeId);
}

export function clearPosLock() {
  localStorage.removeItem(POS_LOCK_KEY);
  localStorage.removeItem(POS_LOCK_STORE_KEY);
}
