import { useLogin } from "@/constants/api";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useUser } from "../contexts/UserContext";
import { useResponsive } from "../hooks/useResponsive";

const EyeOpenIcon = ({ color = "#8B8FA8" }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const EyeClosedIcon = ({ color = "#8B8FA8" }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <Path
      d="M1 1l22 22"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Svg>
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user, token, loading: authLoading } = useUser();
  const { isDesktop } = useResponsive();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const borderAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const toggleVisibility = () => {
    Animated.sequence([
      Animated.timing(iconAnim, {
        toValue: 0.75,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setShowPassword((prev) => !prev);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#2A2D3E", "#5B5FEF"],
  });

  useEffect(() => {
    if (!authLoading && (user || token)) {
      router.replace("/home");
    }
  }, [authLoading, router, token, user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    const token = await useLogin(email, password);
    console.log("Token reçu :", token);
    if (token) {
      login(token);
      router.push("/home");
    } else {
      Alert.alert("Erreur", "Identifiants incorrects");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>

        <View
          style={[
            styles.card,
            isDesktop && { maxWidth: 450, alignSelf: "center", width: "100%" },
          ]}
        >
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accès sécurisé à votre espace</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@mail.com"
              placeholderTextColor="#4A4E6A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.wrapper}>
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                Mot de passe
              </Text>
              <Animated.View style={[styles.inputContainer, { borderColor }]}>
                <TextInput
                  style={{ color: "#FFFFFF" }}
                  placeholder="••••••••"
                  placeholderTextColor="#3A3D52"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={toggleVisibility}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Animated.View style={{ transform: [{ scale: iconAnim }] }}>
                    {showPassword ? (
                      <EyeOpenIcon color={isFocused ? "#5B5FEF" : "#8B8FA8"} />
                    ) : (
                      <EyeClosedIcon
                        color={isFocused ? "#5B5FEF" : "#8B8FA8"}
                      />
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            password.length >= i * 3
                              ? i <= 1
                                ? "#EF5B5B"
                                : i === 2
                                  ? "#EFA45B"
                                  : i === 3
                                    ? "#5BEF8A"
                                    : "#5B5FEF"
                              : "#2A2D3E",
                        },
                      ]}
                    />
                  ))}
                  <Text style={styles.strengthLabel}>
                    {password.length < 3
                      ? "Très faible"
                      : password.length < 6
                        ? "Faible"
                        : password.length < 9
                          ? "Fort"
                          : "Très fort"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signupText}>
              Pas encore de compte ?{"  "}
              <Text style={styles.signupHighlight}>S&apos;inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrapper: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E1B3A",
    borderWidth: 2,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#13132A",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#2A2750",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7A99",
    textAlign: "center",
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 16 },
  wrapper: {},
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: "#A0A8C8",
    marginBottom: 8,
  },
  labelFocused: { color: "#5B5FEF" },
  input: {
    backgroundColor: "#0D0D1A",
    borderWidth: 1,
    borderColor: "#2A2750",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D0D1A",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  iconButton: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: "#4A4E6A",
    marginLeft: 6,
    width: 60,
    textAlign: "right",
  },
  forgotWrapper: { alignSelf: "flex-end", marginBottom: 24, marginTop: -6 },
  forgotText: { color: "#A78BFA", fontSize: 13, fontWeight: "500" },
  button: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  separator: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#2A2750" },
  separatorText: { color: "#4A4E6A", paddingHorizontal: 12, fontSize: 13 },
  signupBtn: { alignItems: "center" },
  signupText: { color: "#6B7A99", fontSize: 14 },
  signupHighlight: { color: "#A78BFA", fontWeight: "700" },
});
