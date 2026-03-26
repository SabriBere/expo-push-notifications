import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { notificationsHistory } from '@/mocks/mockUpsAlert';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  //Mapear listado de notificaciones recibidas desde el socket

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
        <ThemedText type="title">Notificaciones</ThemedText>
      </ThemedView>
      {/* Tarjeta con la información de notificación + combinación con deep linking c/expo router */}
      <View>
        {notificationsHistory?.map((notif:any) => (
          <Pressable
            key={notif.noticiaId}
            onPress={() =>
              router.push({
                pathname: '/news/[id]',
                params: {
                  id: notif.NoticiaId,
                  consultasId: notif.ConsultasId,
                },
              })
            }
          >
            <ThemedView key={notif.noticiaId} style={styles.cardContainer}>
              <ThemedText>{`${notif.Media} | ${notif.Section}`}</ThemedText>
              <ThemedText type="subtitle">{notif.Title}</ThemedText>
            </ThemedView>
          </Pressable>
          
        ))}
      </View>
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
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.49)',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
