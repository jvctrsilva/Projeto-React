import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useWiki } from "../context/wiki-context";

const CATEGORIES = ["Costura", "Robôs", "Eletrônica","Automação", "Outros"];

export default function NewEntryScreen() {
  const router = useRouter();
  const { addEntry } = useWiki();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Costura");

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos da permissão do microfone para gravar o áudio."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setAudioUri(null);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      Alert.alert("Erro", "Não foi possível iniciar a gravação.");
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        setAudioUri(uri);
      }
    } catch (error) {
      console.error("Erro ao parar gravação:", error);
      setIsRecording(false);
      setRecording(null);
      Alert.alert("Erro", "Não foi possível finalizar a gravação.");
    }
  }

  async function pickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos acessar suas imagens para anexar uma foto."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "O título é obrigatório.");
      return;
    }

    try {
      setIsSaving(true);

      addEntry({
        title,
        description,
        audioUri,
        imageUri,
        category,
      });

      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Ajuste da máquina de costura X..."
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Tema / categoria</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = cat === category;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Detalhe o procedimento, dica ou qualquer informação importante..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Imagem (opcional)</Text>
          <View style={styles.imageBox}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <View style={styles.imageButtonsRow}>
                  <TouchableOpacity
                    style={styles.imageButton}
                    onPress={pickImage}
                  >
                    <Text style={styles.imageButtonText}>Trocar imagem</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.imageButton, styles.imageRemoveButton]}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.imageRemoveText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Selecionar imagem</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.audioBox}>
            <Text style={styles.audioTitle}>🎙️ Gravação de áudio</Text>

            <Text style={styles.audioInfo}>
              {audioUri
                ? "Áudio gravado. Toque em salvar para guardar junto com o card."
                : "Grave um áudio com a explicação. Ele ficará disponível para ouvir no card."}
            </Text>

            <View style={styles.audioButtonsRow}>
              {!isRecording ? (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={startRecording}
                >
                  <Text style={styles.audioButtonText}>Iniciar gravação</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.audioButton, styles.audioButtonStop]}
                  onPress={stopRecording}
                >
                  <Text style={styles.audioButtonText}>Parar gravação</Text>
                </TouchableOpacity>
              )}
            </View>

            {isRecording && (
              <Text style={styles.audioRecordingText}>● Gravando...</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (isRecording || isSaving) && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={isRecording || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Salvar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputMultiline: {
    height: 140,
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#94a3b8",
    backgroundColor: "#e5e7eb",
  },
  categoryChipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },
  categoryChipText: {
    fontSize: 12,
    color: "#111827",
  },
  categoryChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  imageBox: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  imageButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  imageButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  imageRemoveButton: {
    backgroundColor: "#e5e7eb",
  },
  imageRemoveText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 13,
  },
  audioBox: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 8,
  },
  audioTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  audioInfo: { fontSize: 12, color: "#075985", marginBottom: 8 },
  audioButtonsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  audioButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  audioButtonStop: {
    backgroundColor: "#dc2626",
  },
  audioButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  audioRecordingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: { color: "#374151", fontSize: 14 },
});
