import React, { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import auth from "@react-native-firebase/auth";
import { Lock, Mail, Phone, ShieldCheck, Sprout, User } from "lucide-react-native";
import { useSetRecoilState } from "recoil";
import { authAtom } from "../../recoil/atoms/authAtom";
import { profileAtom } from "../../recoil/atoms/profileAtom";
import { signupWithFirebaseOtpBff } from "../../services/bff/authBff";

const Signup = ({ onSwitchToLogin, onAuthSuccess }) => {
  const setAuth = useSetRecoilState(authAtom);
  const setProfile = useSetRecoilState(profileAtom);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getE164Phone = (raw) => {
    const cleaned = (raw || "").replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    if (cleaned.startsWith("+")) return cleaned;
    return `+91${cleaned}`;
  };

  const validateSignupFields = () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.password.trim()
    ) {
      setError("All fields are required.");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateSignupFields()) return;

    setLoading(true);
    setError("");

    try {
      const confirmResult = await auth().signInWithPhoneNumber(getE164Phone(formData.phoneNumber));
      setConfirmation(confirmResult);
      setOtpStep(true);
    } catch (e) {
      setError(e?.message || "Unable to send OTP. Please try again.");
    }

    setLoading(false);
  };

  const handleVerifyOtpAndSignup = async () => {
    if (otpCode.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!confirmation) {
      setError("Please request OTP again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const firebaseUserCredential = await confirmation.confirm(otpCode.trim());
      const idToken = await firebaseUserCredential.user.getIdToken();

      const response = await signupWithFirebaseOtpBff({
        ...formData,
        idToken,
      });

      if (response.success) {
        setAuth({
          isAuthenticated: true,
          token: response.data.token,
        });
        setProfile(response.data.profile);
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        setError(response.error.message);
      }

      await auth().signOut();
    } catch (e) {
      setError(e?.message || "OTP verification failed.");
    }

    setLoading(false);
  };

  const maskedPhone = formData.phoneNumber
    ? `${formData.phoneNumber.slice(0, 2)}******${formData.phoneNumber.slice(-2)}`
    : "your number";

  return (
    <View style={styles.card}>
      <View style={styles.softBlobOne} />
      <View style={styles.softBlobTwo} />

      <View style={styles.avatarWrap}>
        <View style={styles.avatarFrame}>
          <Image source={require("../../assets/images/signup_character.png")} style={styles.avatarImage} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.badge}>
          <Sprout size={14} color="#1F7A4A" />
          <Text style={styles.badgeText}>Organic Family Circle</Text>
        </View>
        <Text style={styles.title}>{otpStep ? "Verify OTP" : "Create Account"}</Text>
        <Text style={styles.subtitle}>
          {otpStep ? `Code sent to ${maskedPhone}` : "Fresh ingredients. Zero compromises."}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!otpStep ? (
        <>
          <View style={styles.row}>
            <View style={[styles.fieldWrap, styles.halfField, styles.halfFieldLeft]}>
              <User size={16} color="#78857A" />
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => onChange("firstName", text)}
                placeholder="First name"
                placeholderTextColor="#A9B3AB"
                style={styles.input}
              />
            </View>
            <View style={[styles.fieldWrap, styles.halfField]}>
              <User size={16} color="#78857A" />
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => onChange("lastName", text)}
                placeholder="Last name"
                placeholderTextColor="#A9B3AB"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Mail size={16} color="#78857A" />
            <TextInput
              value={formData.email}
              onChangeText={(text) => onChange("email", text)}
              placeholder="Email address"
              placeholderTextColor="#A9B3AB"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Phone size={16} color="#78857A" />
            <TextInput
              value={formData.phoneNumber}
              onChangeText={(text) => onChange("phoneNumber", text)}
              placeholder="Phone number"
              placeholderTextColor="#A9B3AB"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={[styles.fieldWrap, styles.fieldGapBottom]}>
            <Lock size={16} color="#78857A" />
            <TextInput
              value={formData.password}
              onChangeText={(text) => onChange("password", text)}
              placeholder="Password"
              placeholderTextColor="#A9B3AB"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </>
      ) : (
        <View style={styles.otpContainer}>
          <View style={styles.otpIconWrap}>
            <ShieldCheck size={24} color="#5E3B10" />
          </View>
          <Text style={styles.otpHelpText}>Enter the 6-digit OTP</Text>
          <TextInput
            value={otpCode}
            onChangeText={(text) => setOtpCode((text || "").replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="- - - - - -"
            placeholderTextColor="#D2C4AF"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            style={styles.otpInput}
          />
          <TouchableOpacity onPress={() => setOtpStep(false)} activeOpacity={0.85}>
            <Text style={styles.changePhoneText}>Edit details</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.actionButton, loading ? styles.buttonDisabled : null]}
        onPress={otpStep ? handleVerifyOtpAndSignup : handleSendOtp}
        disabled={loading}
        activeOpacity={0.85}
      >
        <View style={styles.buttonOverlay} />
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.actionText}>{otpStep ? "Verify & Continue" : "Send OTP"}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchAuthCta} onPress={onSwitchToLogin} activeOpacity={0.85}>
        <Text style={styles.switchAuthText}>Already have an account? </Text>
        <Text style={styles.switchAuthLink}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginTop: 56,
    borderRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
    position: "relative",
    backgroundColor: "rgba(255, 251, 244, 0.95)",
    borderWidth: 1,
    borderColor: "#F1E8D9",
    shadowColor: "#24341f",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  avatarWrap: {
    position: "absolute",
    top: -86,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  avatarFrame: {
    width: 156,
    height: 156,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFF7EC",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#294d36",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 9 },
    elevation: 12,
  },
  avatarImage: {
    width: "86%",
    height: "86%",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 24,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "rgba(207, 244, 219, 0.78)",
    borderWidth: 1,
    borderColor: "#B6E2C5",
  },
  badgeText: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#1F7A4A",
  },
  title: {
    fontSize: 39,
    fontWeight: "800",
    color: "#1C1917",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#57534E",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  errorBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#FFF4F3",
    borderWidth: 1,
    borderColor: "#F7CDC8",
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
  },
  halfField: {
    flex: 1,
  },
  halfFieldLeft: {
    marginRight: 12,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#D9E6D8",
    paddingBottom: 6,
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  fieldGapBottom: {
    marginBottom: 18,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1917",
  },
  otpContainer: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 10,
  },
  otpIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6E7D2",
    borderWidth: 1,
    borderColor: "#E4CC9E",
    marginBottom: 10,
  },
  otpHelpText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  otpInput: {
    width: "100%",
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 9,
    color: "#1F2937",
    borderBottomWidth: 2,
    borderBottomColor: "#D9E6D8",
    paddingBottom: 8,
    marginBottom: 12,
  },
  changePhoneText: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
    color: "#047857",
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E1C0A",
    borderWidth: 1,
    borderColor: "#5F4225",
    shadowColor: "#190F05",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: "hidden",
  },
  buttonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  actionText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 2.3,
    zIndex: 1,
  },
  buttonDisabled: {
    backgroundColor: "#8C715A",
    borderColor: "#BCA38C",
  },
  switchAuthCta: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 14,
    color: "#57534E",
    fontWeight: "600",
  },
  switchAuthLink: {
    fontSize: 14,
    color: "#047857",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  softBlobOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(179, 226, 196, 0.32)",
    top: -58,
    right: -48,
  },
  softBlobTwo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 228, 186, 0.34)",
    bottom: -62,
    left: -52,
  },
});

export default Signup;
