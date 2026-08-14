import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button, TextInput, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import authService from '../../services/authService';
import { useCounterStore } from '../../lib/store';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const setUserData = useCounterStore((state) => state.setUserData);
  const setAuthLoading = useCounterStore((state) => state.setAuthLoading);

  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [setUserData, setAuthLoading]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const userData = await authService.signInWithGoogle();
      setUserData(userData);
    } catch (error: any) {
      Alert.alert('Sign-In Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={4}>
        <View style={styles.logoContainer}>
          <Icon name="compass" size={80} color="#6366f1" />
        </View>
        
        <Text style={styles.title}>Welcome to Loki</Text>
        <Text style={styles.subtitle}>
          Discover the best places in Dubai
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGoogleSignIn}
            loading={loading}
            disabled={loading}
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
            icon={() => <Icon name="google" size={20} color="#ffffff" />}
          >
            Sign in with Google
          </Button>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  googleButton: {
    backgroundColor: '#6366f1',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoContainer: {
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#9ca3af',
    lineHeight: 16,
  },
});