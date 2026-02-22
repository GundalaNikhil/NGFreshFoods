import AsyncStorage from "@react-native-async-storage/async-storage";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

export const persistAtom = (key) => ({
  effects: [
    ({ setSelf, onSet }) => {
      const loadPersisted = async () => {
        if (!canUseStorage()) return;
        const persistedValue = await AsyncStorage.getItem(key);
        if (persistedValue) {
          setSelf(JSON.parse(persistedValue));
        }
      };

      loadPersisted();

      onSet((newValue, _, isReset) => {
        if (!canUseStorage()) return;
        if (isReset) {
          AsyncStorage.removeItem(key);
        } else {
          AsyncStorage.setItem(key, JSON.stringify(newValue));
        }
      });
    },
  ],
});
