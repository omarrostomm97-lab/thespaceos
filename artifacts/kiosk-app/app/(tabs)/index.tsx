import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { KIOSK_URL } from "@/constants/config";

export default function KioskScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  const handleNavigationStateChange = () => {
    setLoadError(false);
  };

  const handleReload = () => {
    setLoadError(false);
    webViewRef.current?.reload();
  };

  if (loadError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Feather name="wifi-off" size={52} color="#475569" />
        <Text style={styles.errorTitle}>لا يمكن الاتصال</Text>
        <Text style={styles.errorSub}>
          تحقق من اتصال الإنترنت وحاول مجدداً
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleReload}
          testID="retry-btn"
        >
          <Feather name="refresh-cw" size={18} color="#fff" />
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        ref={webViewRef}
        source={{ uri: KIOSK_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري التحميل…</Text>
          </View>
        )}
        onNavigationStateChange={handleNavigationStateChange}
        onError={() => setLoadError(true)}
        onHttpError={(e) => {
          if (e.nativeEvent.statusCode >= 500) setLoadError(true);
        }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        allowsInlineMediaPlayback
        scalesPageToFit
        androidHardwareAccelerationDisabled={false}
        testID="kiosk-webview"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: "#f1f5f9",
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  errorSub: {
    color: "#64748b",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
