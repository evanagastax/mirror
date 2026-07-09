import React from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView,
} from "react-native";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Top-level error boundary. Catches any unhandled JS errors in the
 * component tree and shows a recoverable "Something went wrong" screen
 * instead of a blank white crash.
 *
 * Wrap the root layout provider with this component.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; swap for a remote logger (Sentry etc.) in prod
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={S.root}>
        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          <Text style={S.emoji}>⚠️</Text>
          <Text style={S.title}>Something went wrong</Text>
          <Text style={S.subtitle}>
            An unexpected error occurred. Your data is safe — tap below to try again.
          </Text>

          <Pressable onPress={this.handleReset} style={S.btn}>
            <Text style={S.btnText}>Try again</Text>
          </Pressable>

          {__DEV__ && (
            <View style={S.debugBox}>
              <Text style={S.debugTitle}>Error (dev only)</Text>
              <Text style={S.debugText}>{this.state.error.message}</Text>
              {this.state.error.stack && (
                <Text style={S.debugStack} numberOfLines={20}>
                  {this.state.error.stack}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const S = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  btn: {
    marginTop: 8,
    backgroundColor: "#1D9E75",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Dev-only error detail
  debugBox: {
    marginTop: 24,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    gap: 6,
  },
  debugTitle: { color: "#D85A30", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  debugText: { color: "#FF6B6B", fontSize: 13, fontWeight: "600" },
  debugStack: { color: "#666666", fontSize: 10, lineHeight: 16, fontFamily: "monospace" },
});
