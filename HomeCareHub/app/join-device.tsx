import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_URL } from "../constants/api";
import { useUser } from "../contexts/UserContext";
import { useResponsive } from "../hooks/useResponsive";

export default function JoinDevice() {
    const router = useRouter();
    const [deviceCode, setDeviceCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { token, user, setDeviceId } = useUser();
    const { isDesktop } = useResponsive();

    const handleJoin = async () => {
        if (!deviceCode.trim()) {
            Alert.alert("Champs manquants", "Veuillez entrer l'ID du dispositif.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/devices/${deviceCode}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                Alert.alert("Succès", "Dispositif connecté avec succès.");
                setDeviceId(deviceCode);
                router.replace("/home");
            } else {
                const errorData = await response.json();
                Alert.alert("Erreur", errorData.error || "Impossible de connecter le dispositif.");
            }
        } catch (err) {
            Alert.alert("Erreur", "Une erreur est survenue lors de la connexion.");
        } finally {
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
                        <Text style={styles.logoEmoji}>🔗</Text>
                    </View>
                    <Text style={styles.appName}>HomeCareHub</Text>
                </View>

                <View
                    style={[
                        styles.card,
                        isDesktop && { maxWidth: 450, alignSelf: "center", width: "100%" },
                    ]}
                >
                    <Text style={styles.title}>Connecter un dispositif</Text>
                    <Text style={styles.subtitle}>Veuillez entrer l'ID du dispositif pour continuer</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ID du dispositif</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: DEV-12345"
                            placeholderTextColor="#4A4E6A"
                            autoCapitalize="none"
                            value={deviceCode}
                            onChangeText={setDeviceCode}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleJoin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Connecter</Text>
                        )}
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
    inputGroup: { marginBottom: 24 },
    label: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.8,
        color: "#A0A8C8",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#0D0D1A",
        borderWidth: 1,
        borderColor: "#2A2750",
        padding: 14,
        borderRadius: 12,
        fontSize: 15,
        color: "#FFFFFF",
    },
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
});
