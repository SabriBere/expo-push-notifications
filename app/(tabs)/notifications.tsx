import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getNotifications } from '@/services/notificationServices';
import type { DemoNotification } from '@/types/demoNotification';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const notifications = (data?.data ?? []) as DemoNotification[];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DDEFEF', dark: '#13282D' }}
      headerImage={
        <View style={styles.headerArtwork}>
          <View style={styles.signalRingLarge} />
          <View style={styles.signalRingSmall} />
          <View style={styles.accentBar} />
          <IconSymbol
            size={154}
            color="#67E8F9"
            name="paperplane.fill"
            style={styles.headerIcon}
          />
        </View>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="defaultSemiBold" style={styles.eyebrow}>
          Inbox
        </ThemedText>
        <ThemedText type="title" style={styles.title}>
          Notifications
        </ThemedText>
      </ThemedView>
      <View style={styles.listContainer}>
        {isLoading ? (
          <ThemedView style={styles.stateCard}>
            <ThemedText type="defaultSemiBold" style={styles.stateTitle}>
              Loading notifications...
            </ThemedText>
            <ThemedText style={styles.stateText}>Checking for recent updates.</ThemedText>
          </ThemedView>
        ) : null}

        {isError ? (
          <ThemedView style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <IconSymbol size={22} color="#FCA5A5" name="bell.badge.fill" />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.stateTitle}>
              Notifications could not be loaded.
            </ThemedText>
            <ThemedText style={styles.stateText}>Check the connection or the configured backend.</ThemedText>
          </ThemedView>
        ) : null}

        {!isLoading && !isError && notifications.length === 0 ? (
          <ThemedView style={styles.stateCard}>
            <ThemedText type="defaultSemiBold" style={styles.stateTitle}>
              No notifications available.
            </ThemedText>
            <ThemedText style={styles.stateText}>New alerts will appear in this list.</ThemedText>
          </ThemedView>
        ) : null}

        {notifications?.map((notif) => (
          <Pressable
            key={notif.itemId}
            onPress={() =>
              router.push({
                pathname: '/demo-items/[id]',
                params: {
                  id: notif.itemId,
                  contextId: notif.contextId,
                },
              })
            }
          >
            <ThemedView style={styles.cardContainer}>
              <ThemedText type="defaultSemiBold" style={styles.cardMeta}>
                {`${notif.source} | ${notif.category}`}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {notif.title}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerArtwork: {
    flex: 1,
  },
  signalRingLarge: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 26,
    borderColor: 'rgba(103, 232, 249, 0.24)',
    left: -82,
    bottom: -110,
    position: 'absolute',
  },
  signalRingSmall: {
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 18,
    borderColor: 'rgba(20, 184, 166, 0.28)',
    right: 24,
    top: 34,
    position: 'absolute',
  },
  accentBar: {
    width: 190,
    height: 58,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 118, 110, 0.52)',
    right: -34,
    bottom: 28,
    position: 'absolute',
    transform: [{ rotate: '-15deg' }],
  },
  headerIcon: {
    bottom: 26,
    left: 44,
    position: 'absolute',
    transform: [{ rotate: '-8deg' }],
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
    fontSize: 40,
    lineHeight: 44,
  },
  listContainer: {
    gap: 12,
  },
  cardContainer: {
    gap: 8,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#243236',
    backgroundColor: '#151B1D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 3,
  },
  cardMeta: {
    color: '#67E8F9',
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    lineHeight: 24,
  },
  stateCard: {
    gap: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#243236',
    backgroundColor: '#151B1D',
  },
  stateIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  stateTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    lineHeight: 24,
  },
  stateText: {
    color: '#CBD5E1',
    lineHeight: 23,
  },
});
