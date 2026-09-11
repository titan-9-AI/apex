// components/ErrorBoundary.tsx — กันแอปจอขาวเมื่อเกิดข้อผิดพลาด
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from './ui';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[APEX] uncaught error:', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text variant="heading" style={{ color: '#fff', textAlign: 'center' }}>
          เกิดข้อผิดพลาด
        </Text>
        <Text style={{ color: '#d8ccf5', textAlign: 'center', marginTop: 8 }}>
          {this.state.error.message}
        </Text>
        <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
          <Button title="ลองใหม่" onPress={this.reset} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#15082b',
  },
});
