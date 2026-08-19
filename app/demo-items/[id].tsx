import React from 'react';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function DemoItemDetailScreen() {
  const { id, contextId } = useLocalSearchParams<{
    id: string;
    contextId?: string;
  }>();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Demo notification</ThemedText>
      </ThemedView>
      <ThemedView style={styles.cardContainer}>
        <ThemedText>
          Generic detail route used to demonstrate notification deep linking.
        </ThemedText>
        <ThemedText>{`Item: ${id}`}</ThemedText>
        {contextId ? <ThemedText>{`Context: ${contextId}`}</ThemedText> : null}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
