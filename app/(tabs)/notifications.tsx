import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getAllNews } from '@/services/newsServices';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

type NewsItem = {
  Title: string;
  Media: string;
  Section: string;
  NoticiaId: number;
  ConsultasId: number;
};

export default function HomeScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getAllNews,
  });

  const notifications = (data?.data ?? []) as NewsItem[];

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
      <View>
        {isLoading ? (
          <ThemedText>Cargando notificaciones...</ThemedText>
        ) : null}

        {isError ? (
          <ThemedText>No se pudieron cargar las notificaciones.</ThemedText>
        ) : null}

        {!isLoading && !isError && notifications.length === 0 ? (
          <ThemedText>No hay notificaciones disponibles.</ThemedText>
        ) : null}

        {notifications?.map((notif) => (
          <Pressable
            key={notif.NoticiaId}
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
            <ThemedView style={styles.cardContainer}>
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
