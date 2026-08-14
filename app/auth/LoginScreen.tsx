import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import authService from '../../services/authService';
import { useCounterStore } from '../../lib/store';

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUserData = useCounterStore((state) => state.setUserData);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Missing info', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === 'signin'
          ? await authService.signInWithEmail(email, password)
          : await authService.signUpWithEmail(name, email, password);
      setUserData(result.userData);
    } catch (error: any) {
      Alert.alert(mode === 'signin' ? 'Sign-in failed' : 'Sign-up failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Icon name="compass" size={72} color="#818cf8" />
          <Text style={styles.brand}>loki</Text>
        </View>

        <Text style={styles.title}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={styles.subtitle}>Discover the best places in Dubai</Text>

        <View style={styles.form}>
          {mode === 'signup' && (
            <TextInput
              mode="outlined"
              label="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={styles.input}
              outlineColor="#27272a"
              activeOutlineColor="#818cf8"
              textColor="#fafafa"
              theme={inputTheme}
            />
          )}
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.input}
            outlineColor="#27272a"
            activeOutlineColor="#818cf8"
            textColor="#fafafa"
            theme={inputTheme}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#27272a"
            activeOutlineColor="#818cf8"
            textColor="#fafafa"
            theme={inputTheme}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                color="#71717a"
                onPress={() => setShowPassword((v) => !v)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            contentStyle={styles.submitContent}
            buttonColor="#6366f1"
            textColor="#ffffff"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            disabled={loading}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signin'
                ? "New to Loki? Create an account"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputTheme = {
  colors: {
    onSurfaceVariant: '#71717a',
    background: '#0b0b0f',
  },
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0b0b0f',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fafafa',
    letterSpacing: 2,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fafafa',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#a1a1aa',
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#0b0b0f',
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 10,
  },
  submitContent: {
    paddingVertical: 8,
  },
  switchMode: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#52525b',
    marginTop: 32,
    lineHeight: 16,
  },
});
