import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Animated, { FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneInputStep from './PhoneInputStep';
import OtpStep from './OtpStep';
import CompleteProfileStep from './CompleteProfileStep';
import { handleGlobalError } from '../../utils/errorHandler';
import authFirebase from '@react-native-firebase/auth';

const { height } = Dimensions.get('window');
const AUTH_FLOW_STORAGE_KEY = 'auth_flow_state';
const AUTH_FLOW_TTL_MS = 60 * 60 * 1000;

const AuthScreen = () => {
  // 'PHONE' | 'OTP' | 'PROFILE'
  const [step, setStep] = useState('PHONE');
  
  // State shared between steps
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState(null);

  useEffect(() => {
    let mounted = true;

    const restoreFlowState = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_FLOW_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        const isExpired =
          !parsed?.savedAt || Date.now() - parsed.savedAt > AUTH_FLOW_TTL_MS;

        if (isExpired) {
          await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
          return;
        }

        if (!parsed?.phoneNumber || parsed.step === 'PHONE') {
          await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
          return;
        }

        if (!mounted) return;
        setPhoneNumber(parsed.phoneNumber);

        if (parsed.step === 'PROFILE' && parsed.firebaseIdToken) {
          setFirebaseIdToken(parsed.firebaseIdToken);
          setStep('PROFILE');
          return;
        }

        if (parsed.step === 'OTP') {
          await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
          return;
        }
      } catch (_error) {
        await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
      }
    };

    restoreFlowState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const persistFlowState = async () => {
      try {
        if (step === 'PHONE') {
          await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
          return;
        }

        if (!phoneNumber) return;

        if (step === 'OTP') {
          await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
          return;
        }

        await AsyncStorage.setItem(
          AUTH_FLOW_STORAGE_KEY,
          JSON.stringify({
            step,
            phoneNumber,
            firebaseIdToken: step === 'PROFILE' ? firebaseIdToken : null,
            savedAt: Date.now(),
          })
        );
      } catch (_error) {
        // no-op: persistence failure should not block auth flow
      }
    };

    persistFlowState();
  }, [step, phoneNumber, firebaseIdToken]);

  const handlePhoneSubmitSuccess = (phone, confirmResult) => {
    setPhoneNumber(phone);
    setConfirmationResult(confirmResult);
    setStep('OTP');
  };

  const handleBackToPhone = () => {
    setStep('PHONE');
    setConfirmationResult(null);
    setFirebaseIdToken(null);
  };

  const handleRequiresProfile = (idToken) => {
    setFirebaseIdToken(idToken);
    setStep('PROFILE');
  };

  const clearFlowState = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
    } catch (_error) {
      // no-op
    }
  };

  const handleResend = async () => {
    try {
      if (authFirebase().currentUser) {
        await authFirebase().signOut();
      }
      const confirmResult = await authFirebase().signInWithPhoneNumber(phoneNumber);
      setConfirmationResult(confirmResult);
      return { success: true };
    } catch (err) {
      console.log("Resend OTP Error:", err);
      const errorMessage = handleGlobalError(err, "Resend OTP");
      return { success: false, error: errorMessage };
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          {/* Top Section: Pixar Character Background */}
          <View style={styles.topSection}>
            <Image 
              source={require('../../assets/images/signup_character.png')} 
              style={styles.characterImage}
              resizeMode="cover"
            />
            {/* Gradient Overlay for a smooth transition to the white card */}
            <View style={styles.gradientOverlay} />
          </View>

          {/* Bottom Section: The White Action Card */}
          <Animated.View 
            style={styles.bottomCard}
            layout={Layout.springify().damping(18).stiffness(150)}
          >
            {step === 'PHONE' ? (
              <Animated.View entering={FadeInDown.duration(400)} key="phone-step">
                <PhoneInputStep onSuccess={handlePhoneSubmitSuccess} />
              </Animated.View>
            ) : step === 'OTP' ? (
              <Animated.View entering={FadeIn.duration(400)} key="otp-step">
                <OtpStep 
                  phoneNumber={phoneNumber} 
                  confirmationResult={confirmationResult} 
                  onBack={handleBackToPhone} 
                  onResend={handleResend}
                  onRequiresProfile={handleRequiresProfile}
                  onAuthSuccess={clearFlowState}
                />
              </Animated.View>
            ) : (
              <Animated.View entering={SlideInRight.duration(400)} key="profile-step">
                <CompleteProfileStep 
                  phoneNumber={phoneNumber} 
                  firebaseIdToken={firebaseIdToken} 
                  onAuthSuccess={clearFlowState}
                />
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background
  },
  innerContainer: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F9FAFB', // Very subtle gray to contrast with white card
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '90%',
    height: '90%',
    position: 'absolute',
    bottom: 20,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent', 
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    minHeight: height * 0.55, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 15, 
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  }
});

export default AuthScreen;
