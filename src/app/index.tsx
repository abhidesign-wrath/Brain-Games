import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGame } from '../games/path/engine';
import { engineFixture } from '../games/path/utils/fixture';

export default function HomeScreen() {
  const state = createGame(engineFixture);
  return <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>Mindtrail</Text>
      <Text style={styles.subtitle}>A daily moment for your mind.</Text>
      <Text testID="foundation-status" style={styles.status}>Day 1 foundation · Engine {state.status}</Text>
      <Text style={styles.note}>Start at 1. Visit each checkpoint in order. Cover every cell with one continuous path.</Text>
      <Text style={styles.note}>Playable touch controls arrive in the next milestone.</Text>
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F3ED' },
  content: { flex: 1, padding: 28, justifyContent: 'center', gap: 20 },
  title: { fontSize: 36, fontWeight: '600', color: '#233B35' },
  subtitle: { fontSize: 20, color: '#233B35' },
  status: { fontSize: 16, color: '#233B35', fontWeight: '600' },
  note: { fontSize: 16, lineHeight: 25, color: '#4B514E' },
});
