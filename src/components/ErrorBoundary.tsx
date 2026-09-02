import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Caught by ErrorBoundary', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 60 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Text style={[typography.h2, { color: colors.danger, marginBottom: spacing.md }]}>
            Something went wrong
          </Text>
          <Text selectable style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
            {error.name}: {error.message}
            {'\n\n'}
            {error.stack}
          </Text>
        </ScrollView>
      </View>
    );
  }
}
