import { useRecoilState, useRecoilValue } from "recoil";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import { fetchMyAddresses, createAddress, deleteAddress } from "../services/bff/accountBff";
import { useMemo, useCallback } from "react";

const normalizeAddresses = (addresses) => {
    if (Array.isArray(addresses)) return addresses;
    if (Array.isArray(addresses?.addresses)) return addresses.addresses;
    if (Array.isArray(addresses?.userAddresses)) return addresses.userAddresses;
    if (Array.isArray(addresses?.data)) return addresses.data;
    return [];
};

export const useAddress = () => {
    const [profile, setProfile] = useRecoilState(profileAtom);
    const authState = useRecoilValue(authAtom);

    const addresses = normalizeAddresses(profile?.addresses);
    const selectedAddressId = profile?.addressId;

    const selectedAddress = useMemo(() => {
        if (!selectedAddressId) return addresses[0] || null;
        return addresses.find(a => a.addressId === selectedAddressId) || addresses[0] || null;
    }, [addresses, selectedAddressId]);

    const refreshAddresses = useCallback(async () => {
        if (!authState?.isAuthenticated) return;
        const response = await fetchMyAddresses();
        if (response.success) {
            const nextAddresses = normalizeAddresses(response.data?.addresses);
            setProfile(prev => ({
                ...prev,
                addresses: nextAddresses,
                // Ensure addressId is set if we have addresses but no ID selected
                addressId: prev.addressId || nextAddresses[0]?.addressId || null
            }));
        }
    }, [authState?.isAuthenticated, setProfile]);

    const handleSelectAddress = useCallback((id) => {
        setProfile(prev => ({ ...prev, addressId: id }));
    }, [setProfile]);

    const handleAddAddress = useCallback(async (payload) => {
        if (!authState?.isAuthenticated) return { success: false, error: "Not authenticated" };
        const response = await createAddress({ payload });
        if (response.success) {
            const newAddress = response.data;
            setProfile(prev => ({
                ...prev,
                addresses: [...normalizeAddresses(prev?.addresses), newAddress],
                addressId: newAddress.addressId
            }));
            return { success: true };
        }
        return response;
    }, [authState?.isAuthenticated, setProfile]);

    const handleDeleteAddress = useCallback(async (addressId) => {
        if (!authState?.isAuthenticated) return { success: false, error: "Not authenticated" };
        const response = await deleteAddress({ addressId });
        if (response.success) {
            setProfile(prev => {
                const filtered = normalizeAddresses(prev?.addresses).filter(a => a.addressId !== addressId);
                return {
                    ...prev,
                    addresses: filtered,
                    addressId: prev.addressId === addressId ? (filtered[0]?.addressId || null) : prev.addressId
                };
            });
        }
        return response;
    }, [authState?.isAuthenticated, setProfile]);

    return {
        addresses,
        selectedAddress,
        selectedAddressId,
        refreshAddresses,
        selectAddress: handleSelectAddress,
        addAddress: handleAddAddress,
        deleteAddress: handleDeleteAddress,
    };
};
