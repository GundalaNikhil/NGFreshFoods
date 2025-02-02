import AsyncStorage from "@react-native-async-storage/async-storage";
export const persistAtom = (key) => ({
  effects: [
    ({ setSelf, onSet }) => {
      const loadPersisted = async () => {
        const persistedValue = await AsyncStorage.getItem(key);
        if (persistedValue) {
          setSelf(JSON.parse(persistedValue));
        }
      };

      loadPersisted();

      onSet((newValue, _, isReset) => {
        if (isReset) {
          AsyncStorage.removeItem(key);
        } else {
          AsyncStorage.setItem(key, JSON.stringify(newValue));
        }
      });
    },
  ],
});
