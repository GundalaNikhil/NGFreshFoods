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

import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authAtom } from "../recoil/atoms/authAtom";
import { cartState } from "../recoil/atoms/cartAtom";
import { mergeCart, replaceCart } from "../services/bff/cartBff";

const MAX_RETRIES = 3;
const DEBOUNCE_MS = 800;

const CartSyncManager = () => {
  const authState = useRecoilValue(authAtom);
  const [cart, setCart] = useRecoilState(cartState);

  // ── refs (stable across renders, no re-render on mutation) ──
  const merged = useRef(false);
  const syncing = useRef(false);
  const lastSyncedVersion = useRef(0);
  const debounceTimer = useRef(null);
  const retryCount = useRef(0);

  // ── 1. Merge on login ──
  useEffect(() => {
    if (!authState?.isAuthenticated) {
      // Reset merge flag on logout so next login re-merges
      merged.current = false;
      lastSyncedVersion.current = 0;
      return;
    }

    if (merged.current || syncing.current) return;

    const runMerge = async () => {
      syncing.current = true;
      try {
        const result = await mergeCart(cart?.items || []);
        if (result?.items?.length > 0) {
          setCart((prev) => ({
            ...prev,
            _version: (prev._version || 0) + 1,
            items: result.items.map((item) => {
              let parsedCustomizations = null;
              if (item.customizations) {
                try {
                  parsedCustomizations = JSON.parse(item.customizations);
                } catch (_e) {
                  parsedCustomizations = null;
                }
              }
              const unitPrice = Number(item.unitPrice || 0);
              const quantity = item.quantity || 1;
              const totalPrice = Number(
                item.totalPrice || unitPrice * quantity || 0
              );
              return {
                productId: item.clientProductId || item.productId,
                id: item.productId,
                name: item.productName,
                image_url: item.imageUrl,
                base_price: unitPrice,
                customizations: parsedCustomizations,
                quantity,
                custQuantity: quantity,
                itemPrice: unitPrice,
                totalPrice,
                custPrice: totalPrice,
              };
            }),
          }));
        }
      } catch (_err) {
        // Merge failed — local cart remains; don't block the user
      } finally {
        merged.current = true;
        // Mark current version as synced so we don't immediately push back
        lastSyncedVersion.current = cart?._version || 0;
        syncing.current = false;
      }
    };

    runMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState?.isAuthenticated]);

  // ── 2. Sync changes to server (debounced, version-gated) ──
  useEffect(() => {
    // Guards: not logged in, merge not done, already syncing, nothing changed
    if (!authState?.isAuthenticated) return;
    if (!merged.current) return;
    if ((cart?._version || 0) <= lastSyncedVersion.current) return;

    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const versionToSync = cart._version;
    const itemsSnapshot = [...(cart?.items || [])];

    debounceTimer.current = setTimeout(() => {
      const push = async (attempt = 0) => {
        if (syncing.current) return; // another sync in progress
        syncing.current = true;
        try {
          await replaceCart(itemsSnapshot);
          lastSyncedVersion.current = versionToSync;
          retryCount.current = 0;
        } catch (_err) {
          if (attempt < MAX_RETRIES) {
            syncing.current = false;
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            setTimeout(() => push(attempt + 1), delay);
            return;
          }
          // Exhausted retries — give up silently; next user action will retry
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
  }, [cart?._version, authState?.isAuthenticated]);

  // Renders nothing — pure sync logic
  return null;
};

export default CartSyncManager;
