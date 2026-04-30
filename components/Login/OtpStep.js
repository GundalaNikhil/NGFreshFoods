import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '../../recoil/atoms/authAtom';
import { profileAtom } from '../../recoil/atoms/profileAtom';
import { loginWithFirebaseOtpBff } from '../../services/bff/authBff';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { handleGlobalError } from '../../utils/errorHandler';
import authFirebase from '@react-native-firebase/auth';

/**
 * Normalize phone numbers to digits-only for comparison,
 * e.g. "+91 98765 43210" → "919876543210"
 */
const normalizePhone = (phone) => (phone || '').replace(/[^0-9]/g, '');

const OtpStep = ({ phoneNumber, confirmationResult, onBack, onResend, onRequiresProfile, onAuthSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [autoVerifying, setAutoVerifying] = useState(false);

  const inputRefs = useRef([]);
  const setAuth = useSetRecoilState(authAtom);
  const setProfile = useSetRecoilState(profileAtom);
  // Guard to prevent double-processing (manual verify + auto-verify race)
  const isProcessingRef = useRef(false);

  /**
   * Shared function to complete the login flow once we have a valid Firebase ID token.
   * Used by both manual OTP verify and the auto-verification listener.
   */
  const completeLoginWithToken = useCallback(async (token) => {
    // Send the Firebase ID Token to the Spring Boot Backend for validation & user sync
    const backendResponse = await loginWithFirebaseOtpBff({ idToken: token });

    if (backendResponse.success) {
      // If the backend returns 200 OK but flags the user as new, route them to profile completion setup!
      if (backendResponse.data.profile.isNewUser) {
        onRequiresProfile(token);
        return;
      }
      
      // Otherwise, hydrate Recoil state with Backend's JWT and Profile and enter the app!
      await onAuthSuccess?.();
      setAuth((prev) => ({
        ...prev,
        isAuthenticated: true,
      }));
      setProfile(backendResponse.data.profile);
    } else {
      throw new Error(backendResponse.error.message || "Failed to authenticate with backend");
    }
  }, [onRequiresProfile, onAuthSuccess, setAuth, setProfile]);

  /**
   * Listen for Firebase auth state changes to detect auto-verification.
   * On real Android devices, Google Play Services can automatically read the SMS
   * and verify the phone number in the background — without the user typing the OTP.
   * When that happens, Firebase emits an auth state change with a signed-in user.
   * We catch that here and proceed directly.
   */
  useEffect(() => {
    const unsubscribe = authFirebase().onAuthStateChanged(async (user) => {
      if (
        user &&
        normalizePhone(user.phoneNumber) === normalizePhone(phoneNumber) &&
        !isProcessingRef.current
      ) {
        // Play Services auto-verified in the background!
        isProcessingRef.current = true;
        setAutoVerifying(true);
        setLoading(true);
        setError('');

        try {
          console.log("Auto-verification detected via onAuthStateChanged. Proceeding automatically.");
          const token = await user.getIdToken();
          await completeLoginWithToken(token);
        } catch (err) {
          console.log("Auto-verification backend error:", err);
          // Don't block the user — they can still verify manually
          isProcessingRef.current = false;
          setAutoVerifying(false);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [phoneNumber, completeLoginWithToken]);

  // Handle Resend Countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = globalThis.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => globalThis.clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    setError('');
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    // Auto-advance to next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
      // Also clear the previous block visually 
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOtp = async () => {
    if (isProcessingRef.current) return; // Already auto-verifying
    
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setError('');

    try {
      if (!confirmationResult) {
        throw new Error("Session expired. Please request OTP again.");
      }

      /**
       * Calls Firebase verify with the OTP string.
       * If successful, it updates the local Firebase state. Then we extract the Bearer token
       * and update the Recoil State, which unmounts the Auth screen and redirects to Home!
       */
      let token = null;
      try {
        const userCredential = await confirmationResult.confirm(code);
        token = await userCredential.user.getIdToken();
      } catch (confirmError) {
        // Fallback: If Android Auto-retriever already verified this natively in the background, 
        // confirm() throws auth/session-expired or auth/invalid-verification-code.
        // We can safely retrieve the native auth state if the user matches.
        const currentUser = authFirebase().currentUser;
        if (
          currentUser && 
          normalizePhone(currentUser.phoneNumber) === normalizePhone(phoneNumber) &&
          (confirmError.code === 'auth/session-expired' || confirmError.code === 'auth/code-expired' || confirmError.code === 'auth/invalid-verification-code')
        ) {
          console.log("User was auto-verified by Play Services. Bypassing manual confirm error.");
          token = await currentUser.getIdToken();
        } else {
          throw confirmError;
        }
      }
      
      await completeLoginWithToken(token);
      
    } catch (err) {
      console.log("Firebase OTP Verification Error: ", err);
      if (err?.code === 'auth/session-expired' || err?.code === 'auth/code-expired') {
        setOtp(['', '', '', '', '', '']);
        setTimer(0);
        setTimeout(() => {
          inputRefs.current.forEach((ref) => ref?.clear?.());
          inputRefs.current[0]?.focus();
        }, 50);
      }
      const errorMessage = handleGlobalError(err, "OTP Verification");
      setError(errorMessage);
    } finally {
      isProcessingRef.current = false;
      setLoading(false);
    }
  };

  const handleResendPress = async () => {
    setLoading(true);
    setError('');
    
    // Call the Firebase integration passed from AuthScreen
    const result = await onResend();
    
    // Set loading to false BEFORE focusing so inputs become editable
    setLoading(false);
    
    if (result.success) {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current.forEach((ref) => ref?.clear?.());
        inputRefs.current[0]?.focus(); // refocus first input after it's editable
      }, 50);
    } else {
      setError(result.error || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft size={24} color="#1F2B24" />
      </TouchableOpacity>

      {/* Typography */}
      <Text style={styles.headingPlayfair}>Verify Number</Text>
      
      <Text style={styles.subheading}>
        We sent a 6-digit secure code to <Text style={styles.boldText}>{phoneNumber}</Text>
      </Text>

      {/* Auto-verification status */}
      {autoVerifying ? (
        <View style={styles.autoVerifyContainer}>
          <ActivityIndicator color="#4A875D" size="small" />
          <Text style={styles.autoVerifyText}>Auto-verifying... Please wait.</Text>
        </View>
      ) : null}

      {/* Error Message Box */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Modern 6-Digit OTP Blocks */}
      <View style={styles.otpOuterContainer}>
        {otp.map((digit, index) => (
          <View 
            key={index} 
            style={[
              styles.otpInputBox, 
              digit ? styles.otpInputBoxFilled : null,
              error ? styles.otpInputBoxError : null
            ]}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInputText}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!loading}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      {/* Resend Timer / Button */}
      <View style={styles.timerRow}>
        <Text style={styles.didNotReceiveText}>Didn't receive the OTP?</Text>
        {timer > 0 ? (
          <Text style={styles.timerText}>Resend in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResendPress} disabled={loading}>
            <Text style={styles.resendActionText}>Resend Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sticky Bottom Verify Button */}
      <TouchableOpacity 
        style={[styles.mainButton, loading || otp.join('').length < 6 ? styles.buttonDisabled : null]}
        onPress={handleVerifyOtp}
        disabled={loading || otp.join('').length < 6}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <CheckCircle2 color="#FFFFFF" size={20} strokeWidth={3} />
            <Text style={styles.mainButtonText}>Verify & Proceed</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
    position: 'relative',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F7F5',
    borderRadius: 20,
  },
  headingPlayfair: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
    color: '#1C1C1C',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headingFallback: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C1C1C',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#686B78',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '800',
    color: '#1C1C1C',
  },
  autoVerifyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E23744',
    marginBottom: 16,
  },
  autoVerifyText: {
    color: '#E23744',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FFF4F3',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E24A4A',
    marginBottom: 16,
  },
  errorText: {
    color: '#E24A4A',
    fontSize: 13,
    fontWeight: '600',
  },
  otpOuterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInputBox: {
    width: 48,
    height: 56,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E9E9EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputBoxFilled: {
    borderColor: '#E23744',
    backgroundColor: '#FFF0F1',
  },
  otpInputBoxError: {
    borderColor: '#F7CDC8',
    backgroundColor: '#FFF4F3',
  },
  otpInputText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  didNotReceiveText: {
    fontSize: 13,
    color: '#93959F',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 13,
    color: '#1C1C1C',
    fontWeight: '700',
  },
  resendActionText: {
    fontSize: 14,
    color: '#E23744',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: '#E23744',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 4,
  },
  buttonDisabled: {
    backgroundColor: '#E9E9EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 8,
  }
});

export default OtpStep;
