import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

export default function NewObject({ callback }) {
  return (
    <View style={{ position: "absolute", bottom: 20, right: 20 }}>
      <TouchableOpacity onPress={callback} activeOpacity={0.7}>
        <View
          style={{
            backgroundColor: "#3B82F6",
            borderRadius: 50,
            padding: 16,
          }}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
