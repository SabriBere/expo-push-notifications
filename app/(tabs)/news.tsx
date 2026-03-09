import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import React from 'react';


export default function NewsScreen() {
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
                    <ThemedText type="title">Noticia</ThemedText>
                </ThemedView>
                <ThemedText>Sección para probar nueva arquitectura de React Native & Expo Go</ThemedText>
                <ThemedText>Detalle de la noticia</ThemedText>
        </ParallaxScrollView>
    )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
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