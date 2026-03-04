import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '../../recoil/atoms/authAtom';
import { profileAtom } from '../../recoil/atoms/profileAtom';
import { loginWithFirebaseOtpBff } from '../../services/bff/authBff';
import { setAuthTokens } from '../../services/http/apiClient';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { handleGlobalError } from '../../utils/errorHandler';

const OtpStep = ({ phoneNumber, confirmationResult, onBack, onResend, onRequiresProfile, onAuthSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);
  const setAuth = useSetRecoilState(authAtom);
  const setProfile = useSetRecoilState(profileAtom);

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
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP');
      return;
    }

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
      const userCredential = await confirmationResult.confirm(code);
      
      const token = await userCredential.user.getIdToken();
      
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
        setAuth({
          isAuthenticated: true,
          token: backendResponse.data.token,
          refreshToken: backendResponse.data.refreshToken,
        });
        setAuthTokens({
          token: backendResponse.data.token,
          refreshToken: backendResponse.data.refreshToken,
        });
        setProfile(backendResponse.data.profile);
      } else {
        throw new Error(backendResponse.error.message || "Failed to authenticate with backend");
      }
      
    } catch (err) {
      console.log("Firebase OTP Verification Error: ", err);
      const errorMessage = handleGlobalError(err, "OTP Verification");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendPress = async () => {
    setLoading(true);
    setError('');
    
    // Call the Firebase integration passed from AuthScreen
    const result = await onResend();
    if (result.success) {
      setTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus(); // refocus first input
    } else {
      setError(result.error || "Failed to resend OTP. Please try again.");
    }
    
    setLoading(false);
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
    color: '#131916',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headingFallback: {
    fontSize: 28,
    fontWeight: '900',
    color: '#131916',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: '#637469',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '800',
    color: '#1F2B24',
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
    backgroundColor: '#F8FBF9',
    borderWidth: 1.5,
    borderColor: '#E2EBE5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputBoxFilled: {
    borderColor: '#4A875D', // Green glow when filled
    backgroundColor: '#EEF6F1',
  },
  otpInputBoxError: {
    borderColor: '#F7CDC8',
    backgroundColor: '#FFF4F3',
  },
  otpInputText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2B24',
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
    color: '#889A8F',
    fontWeight: '500',
  },
  timerText: {
    fontSize: 13,
    color: '#1F2B24',
    fontWeight: '700',
  },
  resendActionText: {
    fontSize: 14,
    color: '#CA153A',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: '#1E2B24', // Deep premium charcoal that commands primary action
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A0E04',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 4, // Padding at bottom of screen
  },
  buttonDisabled: {
    backgroundColor: '#E2EBE5',
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
