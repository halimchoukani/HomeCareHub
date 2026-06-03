import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import { useUser } from "../contexts/UserContext";
import { getDevices } from "../hooks/useDevice";
import { useResponsive } from "../hooks/useResponsive";

export default function JoinDevice() {
    const router = useRouter();
    const [deviceCode, setDeviceCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState<any[]>([]);
    const { token, user, setDeviceId, logout } = useUser();
    const { isDesktop } = useResponsive();

    useEffect(() => {
        const fetchDevices = async () => {
            const data = await getDevices();
            console.log("data: ", data);
            if (data) {
                setDevices(data);
            }
        };
        fetchDevices();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };
    const handleSelectDevice = async (deviceId: string) => {
        setDeviceId(deviceId);
        router.replace("/home");
    }
    const handleJoin = async () => {
        if (!deviceCode.trim()) {
            Alert.alert("Champs manquants", "Veuillez entrer l'ID du dispositif.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/devices/${deviceCode}/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("response", response);
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={28}
                        color="#EF4444"
                    />
                </TouchableOpacity>
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
                        <Text style={styles.subtitle}>Veuillez sélectionner ou entrer l'ID du dispositif</Text>

                        {devices.length > 0 && (
                            <View style={styles.deviceList}>
                                <Text style={styles.label}>Vos dispositifs ({devices.length})</Text>
                                <ScrollView style={styles.devicesScroll} nestedScrollEnabled={true}>
                                    {devices.map((device) => (
                                        <TouchableOpacity
                                            key={device.id}
                                            style={[
                                                styles.deviceItem,
                                                deviceCode === device.id.toString() && styles.deviceItemSelected,
                                            ]}
                                            onPress={() => handleSelectDevice(device.id.toString())}
                                        >
                                            <Ionicons
                                                name="hardware-chip-outline"
                                                size={24}
                                                color={deviceCode === device.id.toString() ? "#FFFFFF" : "#A0A8C8"}
                                            />
                                            <View style={styles.deviceInfo}>
                                                <Text style={[
                                                    styles.deviceName,
                                                    deviceCode === device.id.toString() && styles.deviceTextSelected
                                                ]}>
                                                    Dispositif #{device.id}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ou entrer l'ID manuellement</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 12345"
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0D0D1A" },
    logoutBtn: {
        padding: 16,
        alignItems: "flex-end",
    },
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
    deviceList: {
        marginBottom: 20,
    },
    devicesScroll: {
        maxHeight: 180,
        marginTop: 8,
    },
    deviceItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0D0D1A",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#2A2750",
    },
    deviceItemSelected: {
        borderColor: "#7C3AED",
        backgroundColor: "rgba(124, 58, 237, 0.15)",
    },
    deviceInfo: {
        marginLeft: 12,
    },
    deviceName: {
        color: "#A0A8C8",
        fontSize: 16,
        fontWeight: "600",
    },
    deviceTextSelected: {
        color: "#FFFFFF",
    },
});
