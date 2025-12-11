// context/WikiContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Alert } from "react-native";

export type WikiEntry = {
  id: string;
  title: string;
  description: string;
  audioUri?: string | null;
  imageUri?: string | null;   // NOVO
  category?: string;
  createdAt: string;
};

type AddEntryInput = {
  title: string;
  description: string;
  audioUri?: string | null;
  imageUri?: string | null;
  category?: string;
};

type UpdateEntryInput = Partial<
  Omit<WikiEntry, "id" | "createdAt">
>;

type WikiContextType = {
  entries: WikiEntry[];
  addEntry: (data: AddEntryInput) => void;
  updateEntry: (id: string, data: UpdateEntryInput) => void;
  deleteEntry: (id: string) => void;
};

const WikiContext = createContext<WikiContextType | undefined>(undefined);

type WikiProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "@wiki-oficinas:entries";

export const WikiProvider: React.FC<WikiProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<WikiEntry[]>([]);

  // Carregar dados ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: WikiEntry[] = JSON.parse(stored);
          setEntries(parsed);
        }
      } catch (error) {
        console.error("Erro ao carregar entradas do storage:", error);
      }
    })();
  }, []);

  // Salvar sempre que entries mudar
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (error) {
        console.error("Erro ao salvar entradas no storage:", error);
      }
    })();
  }, [entries]);

  function addEntry({
    title,
    description,
    audioUri,
    imageUri,
    category,
  }: AddEntryInput) {
    if (!title.trim()) {
      Alert.alert("Título obrigatório", "Por favor, preencha o título.");
      return;
    }

    const newEntry: WikiEntry = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      audioUri: audioUri ?? null,
      imageUri: imageUri ?? null,
      category: category ?? "Outros",
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
  }

  function updateEntry(id: string, data: UpdateEntryInput) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...data } : entry
      )
    );
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <WikiContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
      {children}
    </WikiContext.Provider>
  );
};

export function useWiki() {
  const ctx = useContext(WikiContext);
  if (!ctx) {
    throw new Error("useWiki deve ser usado dentro de WikiProvider");
  }
  return ctx;
}
