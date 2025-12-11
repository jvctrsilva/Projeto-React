import { Stack } from "expo-router";
import { WikiProvider } from "../../context/wiki-context";

export default function RootLayout() {
  return (
    <WikiProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Wiki Oficinas" }}
        />
        <Stack.Screen
          name="new"
          options={{ title: "Novo registro" }}
        />
        <Stack.Screen
          name="entry/[id]"
          options={{ title: "Detalhes" }} 
        />
        <Stack.Screen
          name="entry/[id]/edit"
          options={{ title: "Editar registro" }}
        />
      </Stack>
    </WikiProvider>
  );
}
