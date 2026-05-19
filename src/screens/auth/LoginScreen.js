import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const { width } = Dimensions.get('window');

// ─── SVG Decorations (only react-native-svg, which IS in package.json) ────────

const SquiggleDivider = () => {
  const xml = `<svg viewBox="0 0 200 14" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M0 7 C12 2,22 12,34 7 C46 2,56 12,68 7 C80 2,90 12,102 7 C114 2,124 12,136 7 C148 2,158 12,170 7 C182 2,192 12,204 7"
      fill="none" stroke="#D8C8BE" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
  return <SvgXml xml={xml} width="100%" height={14} />;
};

const HandUnderline = () => {
  const xml = `<svg viewBox="0 0 150 9" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6 C24 2,58 8,90 5 C122 2,142 7,152 5"
      fill="none" stroke="#E2B8A8" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`;
  return (
    <SvgXml
      xml={xml}
      width={150}
      height={9}
      style={{ marginTop: 3, marginBottom: 13, marginLeft: 1 }}
    />
  );
};

const BlobBg = () => {
  const xml = `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
    <path d="M35 22 C68 0,120 8,152 40 C184 72,178 122,144 148 C110 174,52 168,24 134 C-4 100,2 44,35 22Z"
      fill="#E2C4B5" opacity="0.38"/>
    <path d="M58 40 C82 24,114 32,136 58 C158 84,150 116,122 132 C94 148,58 138,38 112 C18 86,34 56,58 40Z"
      fill="#CCB0A0" opacity="0.22"/>
  </svg>`;
  return (
    <SvgXml
      xml={xml}
      width={170}
      height={150}
      style={{ position: 'absolute', top: -24, left: -28 }}
    />
  );
};

const DotScatter = () => {
  const xml = `<svg viewBox="0 0 90 44" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7"  cy="13" r="2.8" fill="#C0796A" opacity="0.28"/>
    <circle cx="24" cy="6"  r="2"   fill="#B5342A" opacity="0.18"/>
    <circle cx="42" cy="20" r="3.2" fill="#D4A898" opacity="0.32"/>
    <circle cx="60" cy="9"  r="1.8" fill="#C0796A" opacity="0.22"/>
    <circle cx="76" cy="24" r="2.2" fill="#B5342A" opacity="0.16"/>
    <circle cx="16" cy="34" r="1.6" fill="#D4A898" opacity="0.26"/>
    <circle cx="52" cy="37" r="2.4" fill="#C0796A" opacity="0.20"/>
  </svg>`;
  return (
    <SvgXml
      xml={xml}
      width={90}
      height={44}
      style={{ position: 'absolute', bottom: 8, right: 8 }}
    />
  );
};

// ─── SoftPressable ─────────────────────────────────────────────────────────────
const SoftPressable = ({ onPress, style, children, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.968,
      useNativeDriver: true,
      speed: 40,
      bounciness: 2,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 5,
    }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── AlertBanner ──────────────────────────────────────────────────────────────
const AlertBanner = ({ message, type = 'error', onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 68,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 210,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [message]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <Animated.View
      style={[
        styles.banner,
        isSuccess ? styles.bannerSuccess : styles.bannerError,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={[styles.bannerBadge, isSuccess && styles.bannerBadgeSuccess]}>
        <Text style={styles.bannerBadgeText}>{isSuccess ? '✓' : '!'}</Text>
      </View>
      <Text
        style={[styles.bannerText, isSuccess && styles.bannerTextSuccess]}
        numberOfLines={2}
      >
        {message}
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.bannerCloseText, isSuccess && styles.bannerTextSuccess]}>
          ✕
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const LoginScreen = ({ setIsGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const logoSlide   = useRef(new Animated.Value(-28)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide   = useRef(new Animated.Value(36)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat   = useRef(new Animated.Value(0)).current;

  const { login } = useAuth();
  const navigation = useNavigation();

  // ── Alert helpers ────────────────────────────────────────────────────────────
  const showAlert = (msg, t = 'error') => {
    setAlertMessage(msg);
    setAlertType(t);
    if (t === 'error') setTimeout(() => setAlertMessage(''), 4200);
  };
  const dismissAlert = () => setAlertMessage('');

  // Friendly error mapper for Supabase auth errors
  const friendlyError = (raw = '') => {
    const r = raw.toLowerCase();
    if (r.includes('invalid login') || r.includes('invalid credentials') || r.includes('user not found'))
      return 'Wrong email or password. Double-check and try again.';
    if (r.includes('email not confirmed'))
      return 'Please verify your email first. Check your inbox.';
    if (r.includes('too many requests') || r.includes('rate limit'))
      return 'Too many attempts. Please wait a moment and try again.';
    if (r.includes('network') || r.includes('fetch'))
      return 'No connection. Check your internet and try again.';
    return raw || 'Login failed. Please try again.';
  };

  // ── Mount animations ─────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.stagger(130, [
      Animated.parallel([
        Animated.spring(logoSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(formSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
      ]),
    ]).start();

    // Subtle logo float loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: -5, duration: 2300, useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0,  duration: 2300, useNativeDriver: true }),
      ])
    );
    const t = setTimeout(() => loop.start(), 900);
    return () => { clearTimeout(t); loop.stop(); };
  }, []);

  // ── Shake on error ───────────────────────────────────────────────────────────
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  9, duration: 46, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -9, duration: 46, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  6, duration: 46, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 46, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 46, useNativeDriver: true }),
    ]).start();
    if (Platform.OS !== 'web') {
      Vibration.vibrate(80);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateEmail = (text) => {
    setEmail(text);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    setEmailValid(ok);
    return ok;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    dismissAlert();
    if (!email.trim()) {
      shake();
      showAlert('Please enter your email address.');
      return;
    }
    if (!emailValid) {
      shake();
      showAlert('That email doesn\u2019t look right. Check and try again.');
      return;
    }
    if (!password) {
      shake();
      showAlert('Please enter your password.');
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 75, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setLoginSuccess(true);
        showAlert('Welcome back! Signing you in\u2026', 'success');
        setTimeout(() => setLoginSuccess(false), 2000);
      } else {
        shake();
        showAlert(friendlyError(result.error));
      }
    } catch {
      shake();
      showAlert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (setIsGuest) setIsGuest(true);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      showAlert('Enter your email address first.');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'palengkehub://reset-password',
      });
      if (error) throw error;
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setResetSent(true);
      setTimeout(() => {
        setResetVisible(false);
        setResetSent(false);
        setResetEmail('');
      }, 2500);
    } catch (err) {
      showAlert(err.message || 'Could not send reset email. Try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // ── Derived input border styles ──────────────────────────────────────────────
  const emailInputStyle = [
    styles.inputRow,
    emailFocused                    ? styles.inputFocused : null,
    email.length > 0 && !emailValid ? styles.inputError  : null,
    emailValid && email.length > 0  ? styles.inputValid  : null,
  ];

  const passwordInputStyle = [
    styles.inputRow,
    passwordFocused ? styles.inputFocused : null,
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Organic warm background blob area */}
      <View style={styles.bgTop}>
        <BlobBg />
        <DotScatter />
      </View>

      {/* Inline alert banner */}
      <AlertBanner message={alertMessage} type={alertType} onDismiss={dismissAlert} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: logoOpacity, transform: [{ translateY: logoSlide }] },
          ]}
        >
          {/* Logo with gentle float */}
          <Animated.View style={{ transform: [{ translateY: logoFloat }] }}>
            <View style={styles.logoRing}>
              <LinearGradient
                colors={['#B5342A', '#D9503F']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.logoGrad}
              >
                <Image
                  source={require('../../../src/assets/palengkehublogo.jpg')}
                  style={styles.logoImg}
                  resizeMode="cover"
                />
              </LinearGradient>
            </View>
          </Animated.View>

          <Text style={styles.appName}>PalengkeHub</Text>

          <View style={styles.tagRow}>
            <View style={styles.tagDot} />
            <Text style={styles.tagline}>Lipa City Public Market</Text>
            <View style={styles.tagDot} />
          </View>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View
          style={[
            styles.card,
            { opacity: formOpacity, transform: [{ translateY: formSlide }] },
          ]}
        >
          <Text style={styles.greeting}>Mabuhay! 👋</Text>
          <HandUnderline />
          <Text style={styles.sub}>Sign in to your account</Text>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={emailInputStyle}>
              <Text style={styles.fieldIcon}>✉</Text>
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor="#BEB0A4"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              {emailValid && email.length > 0 && (
                <Text style={styles.validIcon}>✓</Text>
              )}
            </View>
            {email.length > 0 && !emailValid && (
              <Text style={styles.fieldError}>
                Enter a valid email (e.g. juan@email.com)
              </Text>
            )}
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Animated.View
              style={[
                styles.inputRow,
                passwordFocused ? styles.inputFocused : null,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.fieldIcon}>🔑</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Your password"
                placeholderTextColor="#BEB0A4"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowPassword(!showPassword);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeToggle}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Options row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => {
                setRememberMe(!rememberMe);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </TouchableOpacity>

            <SoftPressable onPress={() => setResetVisible(true)}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </SoftPressable>
          </View>

          {/* Sign In button */}
          <Animated.View
            style={[styles.signInBtn, { transform: [{ scale: scaleAnim }] }]}
          >
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading || loginSuccess}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={
                  loginSuccess
                    ? ['#2E8B57', '#3AA86B']
                    : ['#B5342A', '#D9503F', '#E06850']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGrad}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : loginSuccess ? (
                  <Text style={styles.signInText}>\u2713  Signed In</Text>
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Squiggle OR divider */}
          <View style={styles.divider}>
            <View style={{ flex: 1 }}>
              <SquiggleDivider />
            </View>
            <Text style={styles.dividerLabel}>or</Text>
            <View style={{ flex: 1 }}>
              <SquiggleDivider />
            </View>
          </View>

          {/* Guest button */}
          <SoftPressable onPress={handleGuestMode} style={styles.guestBtn}>
            <Text style={styles.guestIcon}>👀</Text>
            <View>
              <Text style={styles.guestTitle}>Browse as Guest</Text>
              <Text style={styles.guestSub}>No account needed</Text>
            </View>
          </SoftPressable>

          {/* Sign up row */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don\u2019t have an account? </Text>
            <SoftPressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                navigation.navigate('SignUp');
              }}
            >
              <Text style={styles.signupLink}>Create one \u2192</Text>
            </SoftPressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Forgot Password Bottom Sheet ── */}
      {resetVisible && (
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setResetVisible(false);
              setResetSent(false);
              setResetEmail('');
            }}
            activeOpacity={1}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Reset Password</Text>
            <Text style={styles.sheetSub}>
              We\u2019ll send a link so you can create a new password.
            </Text>

            {resetSent ? (
              <View style={styles.sentBox}>
                <Text style={styles.sentIcon}>📬</Text>
                <Text style={styles.sentText}>Email sent! Check your inbox.</Text>
              </View>
            ) : (
              <>
                <View style={[styles.inputRow, { marginBottom: 22 }]}>
                  <Text style={styles.fieldIcon}>✉</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="your@email.com"
                    placeholderTextColor="#BEB0A4"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={styles.signInBtn}
                  onPress={handleForgotPassword}
                  disabled={resetLoading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#B5342A', '#D9503F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.signInGrad}
                  >
                    {resetLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.signInText}>Send Reset Link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setResetVisible(false);
                setResetSent(false);
                setResetEmail('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FBF4EE',
  },

  // Organic warm blob background — height is NOT fixed; driven by content
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 248,
    backgroundColor: '#EED9CC',
    // Asymmetric bottom corners — not identical
    borderBottomLeftRadius: 56,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },

  // ── Alert Banner ─────────────────────────────────────────────────────────────
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 14,
    left: 14,
    right: 14,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    // Asymmetric pill: very round left, flatter right
    borderRadius: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingLeft: 12,
    paddingRight: 14,
    paddingTop: 11,
    paddingBottom: 13,
    gap: 10,
    shadowColor: '#5C2D1A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerError: {
    backgroundColor: '#FFF2EF',
    borderWidth: 1,
    borderColor: '#F5C0B6',
  },
  bannerSuccess: {
    backgroundColor: '#EDFAF3',
    borderWidth: 1,
    borderColor: '#A8EACC',
  },
  bannerBadge: {
    width: 24,
    height: 24,
    // Organic squircle shape
    borderRadius: 10,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#D9503F',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  bannerBadgeSuccess: { backgroundColor: '#2E8B57' },
  bannerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bannerText: {
    flex: 1,
    fontSize: 13.5,
    color: '#6E2518',
    fontWeight: '500',
    lineHeight: 18,
  },
  bannerTextSuccess: { color: '#1A6640' },
  bannerCloseText: { fontSize: 12, color: '#A84030', fontWeight: '600' },

  // ── Scroll ────────────────────────────────────────────────────────────────────
  scroll: {
    flexGrow: 1,
    paddingBottom: 44,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: 18,
    paddingLeft: 10,
    position: 'relative',
  },

  logoRing: {
    width: 96,
    height: 96,
    // Organic blob: not a perfect circle
    borderRadius: 999,
    borderTopLeftRadius: 36,
    borderBottomRightRadius: 36,
    borderWidth: 3,
    borderColor: '#F2E4DB',
    overflow: 'hidden',
    shadowColor: '#B5342A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 14,
  },
  logoGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 96,
    height: 96,
  },

  appName: {
    fontSize: Math.min(26, width * 0.067),
    fontWeight: '800',
    color: '#2A1610',
    letterSpacing: 0.2,
    marginBottom: 7,
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderTopRightRadius: 3,
    backgroundColor: '#B5342A',
    opacity: 0.42,
  },
  tagline: {
    fontSize: 11.5,
    color: '#8A6558',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    fontWeight: '500',
  },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    marginLeft: 14,
    marginRight: 18,
    backgroundColor: '#FFFAF7',
    // Every corner a different radius — intentionally non-uniform
    borderTopLeftRadius: 28,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 22,
    // Asymmetric internal padding
    paddingTop: 26,
    paddingBottom: 32,
    paddingLeft: 22,
    paddingRight: 26,
    shadowColor: '#6B3020',
    shadowOffset: { width: -2, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },

  greeting: {
    fontSize: Math.min(23, width * 0.059),
    fontWeight: '700',
    color: '#1E1008',
  },
  sub: {
    fontSize: 13.5,
    color: '#9E8070',
    marginBottom: 22,
    marginTop: 2,
  },

  // ── Fields ───────────────────────────────────────────────────────────────────
  fieldGroup: { marginBottom: 16 },

  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6558',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 9,
    marginLeft: 2,
  },

  // Organic input: pill on left, flatter right
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE7',
    borderRadius: 16,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E4D3C8',
    paddingLeft: 16,
    paddingRight: 12,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: '#C9896A',
    backgroundColor: '#FDF6F0',
    shadowColor: '#C0796A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: '#D9503F',
    backgroundColor: '#FFF3F1',
  },
  inputValid: {
    borderColor: '#4A9E72',
    backgroundColor: '#F2FAF6',
  },

  fieldIcon: { fontSize: 15, marginRight: 10, color: '#C0796A' },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1E1008',
    paddingVertical: 13,
  },
  validIcon: { fontSize: 15, color: '#4A9E72', fontWeight: '700', marginLeft: 6 },
  eyeToggle: { fontSize: 12.5, color: '#B5342A', fontWeight: '600', paddingLeft: 8 },
  fieldError: { fontSize: 11.5, color: '#C0392B', marginTop: 5, marginLeft: 3 },

  // ── Options Row ──────────────────────────────────────────────────────────────
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Organic squircle checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 7,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B5342A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOn: { backgroundColor: '#B5342A' },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rememberLabel: { fontSize: 13, color: '#8A6558' },
  forgotLink: { fontSize: 13, color: '#B5342A', fontWeight: '600' },

  // ── Sign In Button ────────────────────────────────────────────────────────────
  signInBtn: {
    borderRadius: 18,
    borderTopRightRadius: 11,
    borderBottomLeftRadius: 11,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#B5342A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  signInGrad: {
    paddingTop: 16,
    paddingBottom: 14,
    alignItems: 'center',
  },
  signInText: { color: '#fff', fontSize: 15.5, fontWeight: '700', letterSpacing: 0.25 },

  // ── OR Divider ────────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  dividerLabel: { fontSize: 12, color: '#BEB0A4', fontWeight: '500', paddingHorizontal: 2 },

  // ── Guest Button ──────────────────────────────────────────────────────────────
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1.5,
    borderColor: '#E4D3C8',
    borderRadius: 18,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingTop: 13,
    paddingBottom: 15,
    paddingLeft: 18,
    paddingRight: 14,
    backgroundColor: '#F5EDE7',
    marginBottom: 22,
  },
  guestIcon: { fontSize: 24 },
  guestTitle: { fontSize: 14.5, fontWeight: '600', color: '#2A1610' },
  guestSub: { fontSize: 11.5, color: '#9E8070', marginTop: 2 },

  // ── Sign Up ───────────────────────────────────────────────────────────────────
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 13.5, color: '#9E8070' },
  signupLink: { fontSize: 13.5, color: '#B5342A', fontWeight: '700' },

  // ── Bottom Sheet ──────────────────────────────────────────────────────────────
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,14,6,0.42)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  sheet: {
    backgroundColor: '#FFFAF7',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 46 : 28,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4D3C8',
    alignSelf: 'center',
    marginBottom: 22,
  },
  sheetTitle: { fontSize: 21, fontWeight: '700', color: '#1E1008', marginBottom: 7 },
  sheetSub: { fontSize: 13.5, color: '#8A6558', marginBottom: 22, lineHeight: 19 },
  sentBox: { alignItems: 'center', paddingTop: 20, paddingBottom: 24, gap: 11 },
  sentIcon: { fontSize: 38 },
  sentText: { fontSize: 15.5, color: '#2E8B57', fontWeight: '600', textAlign: 'center' },
  cancelBtn: { paddingTop: 16, paddingBottom: 12, alignItems: 'center' },
  cancelText: { fontSize: 13.5, color: '#9E8070', fontWeight: '500' },
});