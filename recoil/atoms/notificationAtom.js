import { atom } from "recoil";

export const notificationAtom = atom({
  key: "notificationAtom",
  default: {
    permissionStatus: "UNDETERMINED",
    lastTokenSyncAt: null,
    feed: [],
    preferences: null,
    intent: null,
    intentUpdatedAt: null,
  },
});
