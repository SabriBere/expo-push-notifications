import { Collapsible } from '@/assets/ui/collapsible';
import { IconSymbol } from '@/assets/ui/icon-symbol';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

const appVersion = Constants.expoConfig?.version ?? 'dev';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DDEFEF', dark: '#142426' }}
      headerImage={
        <View style={styles.headerArtwork}>
          <View style={styles.glowCircle} />
          <View style={styles.panelShape} />
          <View style={styles.smallShape} />
          <IconSymbol
            size={168}
            color="#67E8F9"
            name="bell.badge.fill"
            style={styles.headerIcon}
          />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="defaultSemiBold" style={styles.eyebrow}>
          Control center
        </ThemedText>
        <ThemedText
          type="title"
          style={styles.title}>
          Settings
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.description}>
        Manage system permissions and the real-time connection for test alerts.
      </ThemedText>
      <ThemedView style={styles.versionPill}>
        <IconSymbol size={18} color="#67E8F9" name="checkmark.seal.fill" />
        <ThemedText
          type="defaultSemiBold"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          APK version {appVersion}
        </ThemedText>
      </ThemedView>
      <Collapsible title="Notification controls" />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerArtwork: {
    flex: 1,
  },
  glowCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(103, 232, 249, 0.13)',
    top: -50,
    right: -40,
    position: 'absolute',
  },
  panelShape: {
    width: 280,
    height: 132,
    borderRadius: 36,
    backgroundColor: 'rgba(15, 118, 110, 0.42)',
    bottom: -24,
    left: -72,
    position: 'absolute',
    transform: [{ rotate: '-10deg' }],
  },
  smallShape: {
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    bottom: 28,
    right: 34,
    position: 'absolute',
    transform: [{ rotate: '12deg' }],
  },
  headerIcon: {
    bottom: 18,
    left: 34,
    position: 'absolute',
  },
  titleContainer: {
    gap: 8,
  },
  eyebrow: {
    color: '#67E8F9',
    textTransform: 'uppercase',
    letterSpacing: 0,
    fontSize: 12,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 40,
    lineHeight: 44,
  },
  description: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 26,
  },
  versionPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#243236',
    backgroundColor: '#151B1D',
  },
});
