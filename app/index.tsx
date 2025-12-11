import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useWiki, WikiEntry } from "../context/wiki-context";

const CATEGORIES = ["Todos", "Costura", "Robôs", "Eletrônica", "Automação", "Outros"];

export default function HomeScreen() {
  const router = useRouter();
  const { entries } = useWiki();

  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const filteredEntries = useMemo(() => {
    if (selectedCategory === "Todos") return entries;
    return entries.filter((e) => e.category === selectedCategory);
  }, [entries, selectedCategory]);

function renderItem({ item }: { item: WikiEntry }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/entry/${item.id}`)}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.title}>{item.title}</Text>
        {item.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        )}
      </View>

      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.thumbImage} />
      )}

      {item.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      ) : (
        <Text style={styles.descriptionMuted} numberOfLines={2}>
          (Sem descrição em texto)
        </Text>
      )}

      <Text style={styles.meta}>
        {item.audioUri ? "🎙️ Possui áudio" : "📝 Somente texto"}
      </Text>
    </TouchableOpacity>
  );
}

  return (
    <View style={styles.container}>
      {/* Navbar / filtro topo */}
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>Categorias</Text>
        <View style={styles.navChipsGroup}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.navChip,
                  isSelected && styles.navChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.navChipText,
                    isSelected && styles.navChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum registro para esta categoria.
          </Text>
          <Text style={styles.emptySubText}>
            Toque em Novo registro para adicionar uma nota de oficina.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new")}
      >
        <Text style={styles.fabText}>+ Novo registro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

    navbar: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  navbarTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  navbarScrollContent: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  navChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  navChipSelected: {
    backgroundColor: "#2563eb",
  },
  navChipText: {
    fontSize: 12,
    color: "#111827",
  },
  navChipTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  listContent: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "600", marginRight: 8 },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  categoryTagText: { fontSize: 11, color: "#374151", fontWeight: "500" },
  description: { fontSize: 14, color: "#444", marginBottom: 6 },
  descriptionMuted: { fontSize: 13, color: "#9ca3af", marginBottom: 6 },
  meta: { fontSize: 12, color: "#777" },

  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  fabText: { color: "#fff", fontWeight: "600" },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: { fontSize: 14, color: "#555", textAlign: "center" },

  thumbImage: {
  width: "100%",
  height: 100,
  borderRadius: 8,
  marginBottom: 6,
  },

  navChipsGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

});
