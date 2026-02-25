import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistAtom = (key) => ({
  effects: [
    ({ setSelf, onSet }) => {
      const loadPersisted = async () => {
        try {
          const persistedValue = await AsyncStorage.getItem(key);
          if (persistedValue) {
            setSelf(JSON.parse(persistedValue));
          }
        } catch (error) {
          console.error(`Failed to load persisted atom "${key}"`, error);
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
