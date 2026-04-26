import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../services/firebaseConfig';
import authFirebase from '@react-native-firebase/auth';
import { Phone, ChevronRight } from 'lucide-react-native';
import { handleGlobalError } from '../../utils/errorHandler';

const PhoneInputStep = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    // Basic validation
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    // Format the phone number with the +91 country code
    const formattedNumber = `+91${phoneNumber}`;

    try {
      // Reset any stale phone-auth session before starting a new OTP flow.
      if (authFirebase().currentUser) {
        await authFirebase().signOut();
      }

      /**
       * Calls Firebase Auth to send an SMS to the user's phone.
       * If successful, it returns a ConfirmationResult object containing verificationId.
       * 
       * NOTE: This assumes Firebase Phone Auth is enabled in the Firebase Console
       * Android requires SHA-1 / SHA-256 keys to be registered for this to work flawlessly.
       */
      const confirmation = await authFirebase().signInWithPhoneNumber(formattedNumber);
      
      // Successfully sent the OTP. Pass the string back to the parent to render OtpStep
      onSuccess(formattedNumber, confirmation);
    } catch (err) {
      console.log("Firebase Phone Auth Error: ", err);
      const errorMessage = handleGlobalError(err, "Phone Input");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic typography loading */}
      <Text style={styles.headingPlayfair}>Welcome to FreshFarms</Text>
      
      <Text style={styles.subheading}>
        Enter your mobile number to get the freshest groceries delivered to your door.
      </Text>

      {/* Error Message Box */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* The Premium Input Field */}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <View style={styles.countryCodeBox}>
          <Text style={styles.flagEmoji}>🇮🇳</Text>
          <Text style={styles.countryCodeText}>+91</Text>
        </View>
        <TextInput
          style={styles.phoneNumberInput}
          placeholder="Mobile Number"
          placeholderTextColor="#7a8a80"
          keyboardType="phone-pad"
          maxLength={10}
          value={phoneNumber}
          onChangeText={(text) => {
            setError(''); // Clear error on edit
            setPhoneNumber(text.replace(/[^0-9]/g, ''));
          }}
          editable={!loading}
        />
      </View>

      {/* Sticky Bottom Button */}
      <TouchableOpacity 
        style={[styles.mainButton, loading || phoneNumber.length < 10 ? styles.buttonDisabled : null]}
        onPress={handleSendOtp}
        disabled={loading || phoneNumber.length < 10}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.mainButtonText}>Get OTP</Text>
            <ChevronRight color="#FFFFFF" size={20} strokeWidth={3} />
          </>
        )}
      </TouchableOpacity>

      {/* Terms and Conditions Disclaimer */}
      <Text style={styles.disclaimerText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> &{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E9E9EB',
    borderRadius: 16,
    height: 64,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  inputError: {
    borderColor: '#F7CDC8',
    backgroundColor: '#FFF4F3',
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E9E9EB',
    paddingRight: 12,
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: 2, // Adds a premium gap between numbers
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: '#E23744',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E23744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
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
    marginRight: 4,
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#93959F',
    lineHeight: 18,
  },
  linkText: {
    color: '#E23744',
    fontWeight: '700',
    textDecorationLine: 'underline',
  }
});

export default PhoneInputStep;
