import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistAtom = (key) => ({
  effects: [
    ({ setSelf, onSet }) => {
      const loadPersisted = async () => {
        try {
          const persistedValue = await AsyncStorage.getItem(key);
          if (persistedValue) {
            const parsed = JSON.parse(persistedValue);
            // Ensure isHydrated is set to true when loading from storage, but ONLY for objects (not arrays)
            const updated = (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed))
              ? { ...parsed, isHydrated: true }
              : parsed;
            setSelf(updated);
          } else {
            // Even if no data, we are "hydrated" (finished checking storage)
            setSelf((current) => {
              if (typeof current === "object" && current !== null && !Array.isArray(current)) {
                return { ...current, isHydrated: true };
              }
              return current;
            });
          }
        } catch (error) {
          console.error(`Failed to load persisted atom "${key}"`, error);
          // Safety: If storage fails, still mark as hydrated so we don't hang the app
          setSelf((current) => {
            if (typeof current === "object" && current !== null) {
              return { ...current, isHydrated: true };
            }
            return current;
          });
        }
      };

      loadPersisted();

      onSet((newValue, _, isReset) => {
        try {
          if (isReset) {
            AsyncStorage.removeItem(key);
          } else {
            AsyncStorage.setItem(key, JSON.stringify(newValue));
          }
        } catch (error) {
          console.error(`Failed to persist atom "${key}"`, error);
        }
      });
    },
  ],
});
