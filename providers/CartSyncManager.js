/**
 * CartSyncManager
 *
 * Dedicated component that manages all cart ↔ server synchronisation.
 * Renders no UI. Mount once inside the authenticated app tree.
 *
 * Responsibilities:
 *   1. Merge local cart with server cart on first login
 *   2. Push local changes to server (debounced, version-gated)
 *   3. Retry failed syncs with exponential back-off (up to 3 attempts)
 */

import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authAtom } from "../recoil/atoms/authAtom";
import { cartState } from "../recoil/atoms/cartAtom";
import { fetchCart, replaceCart } from "../services/bff/cartBff";
import { generateCartKey } from "../utils/cartHelper";

const MAX_RETRIES = 3;
const DEBOUNCE_MS = 800;
const HYDRATION_DELAY_MS = 1500;

const CartSyncManager = () => {
  const authState = useRecoilValue(authAtom);
  const [cart, setCart] = useRecoilState(cartState);

  const merged = useRef(false);
  const syncing = useRef(false);
  const lastSyncedVersion = useRef(0);
  const debounceTimer = useRef(null);
  const retryCount = useRef(0);
  const [hydrated, setHydrated] = useState(false);

  // Wait for persisted state to load from AsyncStorage before syncing
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[CartSync] Hydration complete");
      setHydrated(true);
    }, HYDRATION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Validate that a server cart item is in the new format and worth merging.
   * Rejects old-format items (missing cartKey, variantId, or 0 unitPrice).
   */
  const isValidNewFormatItem = (item) => {
    if (!item) return false;
    if (!item.cartKey && !item.productId) return false;
    // Skip items with 0 or missing unitPrice — they're old-format ghosts
    if (!item.unitPrice || Number(item.unitPrice) <= 0) return false;
    return true;
  };

  /**
   * Convert a server cart item to new local shape.
   */
  const toLocalItem = (item) => {
    const unitPrice = Number(item.unitPrice || 0);
    const quantity = item.quantity || 1;
    const productId = item.productId || "";
    const variantId = item.variantId || null;
    const addonIds = item.addonIds || [];
    const cartKey =
      item.cartKey || generateCartKey(productId, variantId, addonIds);

    return {
      cartKey,
      productId,
      variantId,
      addonIds,
      quantity,
      unitPrice,
      lineTotal: Number((unitPrice * quantity).toFixed(2)),
      name: item.productName || item.name || "",
      imageUrl: item.imageUrl || "",
      variantLabel: item.variantLabel || null,
      addonLabels: item.addonLabels || [],
      addonGroups: item.addonGroups || {},
    };
  };

  // ── 1. Reconcile on login (runs ONCE) ──
  useEffect(() => {
    if (!authState?.isAuthenticated || !hydrated) {
      merged.current = false;
      lastSyncedVersion.current = 0;
      return;
    }

    if (merged.current || syncing.current) return;

    const runMerge = async () => {
      syncing.current = true;
      try {
        console.log("[CartSync] Starting merge...");
        const serverCart = await fetchCart();
        const rawServerItems = serverCart?.items || [];

        // Filter out old-format items (no unitPrice / no cartKey)
        const validServerItems = rawServerItems.filter(isValidNewFormatItem);
        const skippedCount = rawServerItems.length - validServerItems.length;
        if (skippedCount > 0) {
          console.log(
            `[CartSync] Skipped ${skippedCount} old-format items from server`
          );
        }

        const serverItems = validServerItems.map(toLocalItem);
        const localItems = cart?.items || [];

        console.log("[CartSync] Merge:", {
          serverItemCount: serverItems.length,
          localItemCount: localItems.length,
        });

        // Merge by cartKey: local wins over server
        const mergedMap = new Map();
        serverItems.forEach((item) => mergedMap.set(item.cartKey, item));
        localItems.forEach((item) => mergedMap.set(item.cartKey, item)); // local wins

        const mergedItems = Array.from(mergedMap.values());

        console.log("[CartSync] Merged result:", mergedItems.length, "items");

        // Always push the clean merged state to server (even if empty — clears old items)
        await replaceCart(mergedItems);
        setCart((prev) => ({
          ...prev,
          _version: (prev._version || 0) + 1,
          items: mergedItems,
        }));
      } catch (err) {
        console.warn("[CartSync] Merge failed:", err?.message);
        // Merge failed — local cart remains untouched
      } finally {
        merged.current = true;
        lastSyncedVersion.current = cart?._version || 0;
        syncing.current = false;
      }
    };

    runMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState?.isAuthenticated, hydrated]);

  // ── 2. Sync changes to server (debounced, version-gated) ──
  useEffect(() => {
    if (!authState?.isAuthenticated || !hydrated) return;
    if (!merged.current) return;
    if ((cart?._version || 0) <= lastSyncedVersion.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const versionToSync = cart._version;
    // Only sync items — NOT the coupon/offer metadata
    const itemsSnapshot = [...(cart?.items || [])];

    debounceTimer.current = setTimeout(() => {
      const push = async (attempt = 0) => {
        if (syncing.current) return;
        syncing.current = true;
        try {
          console.log(
            `[CartSync] Pushing ${itemsSnapshot.length} items (v${versionToSync})`
          );
          await replaceCart(itemsSnapshot);
          lastSyncedVersion.current = versionToSync;
          retryCount.current = 0;
        } catch (_err) {
          if (attempt < MAX_RETRIES) {
            syncing.current = false;
            const delay = Math.pow(2, attempt) * 1000;
            setTimeout(() => push(attempt + 1), delay);
            return;
          }
          retryCount.current = 0;
        } finally {
          syncing.current = false;
        }
      };

      push(0);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?._version, authState?.isAuthenticated, hydrated]);

  return null;
};

export default CartSyncManager;
