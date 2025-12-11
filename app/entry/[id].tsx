import { Audio } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useWiki } from "../../context/wiki-context";

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entries, deleteEntry } = useWiki();
  const entry = entries.find((e) => e.id === id);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSound, setIsLoadingSound] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1); // evitar divisão por zero

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Registro não encontrado.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const safeEntry = entry;

  const progress =
    durationMillis > 0 ? positionMillis / durationMillis : 0;

  async function handlePlayPause() {
    if (!safeEntry.audioUri) return;

    try {
      setIsLoadingSound(true);
    
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: safeEntry.audioUri },
          { shouldPlay: true },
        );

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          setPositionMillis(status.positionMillis ?? 0);
          setDurationMillis(status.durationMillis ?? 1);

          if (status.didJustFinish) {
            setIsPlaying(false);
          } else {
            setIsPlaying(status.isPlaying);
          }
        });

        setSound(newSound);
        setIsPlaying(true);
      } else {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) return;

        const atEnd =
          status.positionMillis !== undefined &&
          status.durationMillis !== undefined &&
          status.positionMillis >= status.durationMillis - 50;

        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);

        } else {
          if (atEnd) {
            await sound.setPositionAsync(0);
          }
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
    } finally {
      setIsLoadingSound(false);
    }
  }

  function handleEdit() {
  router.push(`/entry/${safeEntry.id}/edit`);
  }

  function handleDelete() {
    Alert.alert(
      "Excluir registro",
      "Tem certeza que deseja excluir este card? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            deleteEntry(safeEntry.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: safeEntry?.category || "Detalhes",
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{entry.title}</Text>
          {entry.category && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{entry.category}</Text>
            </View>
          )}
        </View>

        {entry.imageUri && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Imagem</Text>
            <Image source={{ uri: entry.imageUri }} style={styles.detailImage} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descrição</Text>
          {entry.description ? (
            <Text style={styles.description}>{entry.description}</Text>
          ) : (
            <Text style={styles.descriptionMuted}>
              Nenhuma descrição em texto foi adicionada.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Áudio</Text>
          {entry.audioUri ? (
            <>
              <Text style={styles.audioInfo}>
                Áudio associado a este card. Use o botão abaixo para reproduzir.
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { flex: progress },
                  ]}
                />
                <View
                  style={[
                    styles.progressRemaining,
                    { flex: 1 - progress },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={styles.audioButton}
                onPress={handlePlayPause}
                disabled={isLoadingSound}
              >
                {isLoadingSound ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.audioButtonText}>
                    {isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.descriptionMuted}>
              Nenhum áudio foi gravado para este card.
            </Text>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    marginTop: 4,
  },
  categoryTagText: { fontSize: 12, color: "#374151", fontWeight: "500" },
  cardTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  detailImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
  },
  description: { fontSize: 14, color: "#111827" },
  descriptionMuted: { fontSize: 14, color: "#6b7280" },
  audioInfo: { fontSize: 13, color: "#4b5563", marginBottom: 8 },

  progressBar: {
    flexDirection: "row",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  progressFill: {
    backgroundColor: "#4f46e5",
  },
  progressRemaining: {
    backgroundColor: "transparent",
  },

  audioButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  audioButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  backButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  backButtonText: { color: "#111827", fontSize: 14, fontWeight: "500" },
  notFoundText: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});
