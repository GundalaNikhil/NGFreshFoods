import { useRecoilState, useRecoilValue } from "recoil";
import { profileAtom } from "../recoil/atoms/profileAtom";
import { authAtom } from "../recoil/atoms/authAtom";
import { fetchMyAddresses, createAddress, deleteAddress, updateAddress } from "../services/bff/accountBff";
import { useMemo, useCallback } from "react";

export const useAddress = () => {
    const [profile, setProfile] = useRecoilState(profileAtom);
    const authState = useRecoilValue(authAtom);
    const token = authState?.token;

    const addresses = profile?.addresses || [];
    const selectedAddressId = profile?.addressId;

    const selectedAddress = useMemo(() => {
        if (!selectedAddressId) return addresses[0] || null;
        return addresses.find(a => a.addressId === selectedAddressId) || addresses[0] || null;
    }, [addresses, selectedAddressId]);

    const refreshAddresses = useCallback(async () => {
        if (!token) return;
        const response = await fetchMyAddresses({ token });
        if (response.success) {
            setProfile(prev => ({
                ...prev,
                addresses: response.data.addresses || [],
                // Ensure addressId is set if we have addresses but no ID selected
                addressId: prev.addressId || response.data.addresses?.[0]?.addressId || null
            }));
        }
    }, [token, setProfile]);

    const handleSelectAddress = useCallback((id) => {
        setProfile(prev => ({ ...prev, addressId: id }));
    }, [setProfile]);

    const handleAddAddress = useCallback(async (payload) => {
        if (!token) return { success: false, error: "Not authenticated" };
        const response = await createAddress({ token, payload });
        if (response.success) {
            const newAddress = response.data;
            setProfile(prev => ({
                ...prev,
                addresses: [...prev.addresses, newAddress],
                addressId: newAddress.addressId
            }));
            return { success: true };
        }
        return response;
    }, [token, setProfile]);

    const handleDeleteAddress = useCallback(async (addressId) => {
        if (!token) return { success: false, error: "Not authenticated" };
        const response = await deleteAddress({ token, addressId });
        if (response.success) {
            setProfile(prev => {
                const filtered = prev.addresses.filter(a => a.addressId !== addressId);
                return {
                    ...prev,
                    addresses: filtered,
                    addressId: prev.addressId === addressId ? (filtered[0]?.addressId || null) : prev.addressId
                };
            });
        }
        return response;
    }, [token, setProfile]);

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
