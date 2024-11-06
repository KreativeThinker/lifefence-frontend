import { MaterialIcons } from "@expo/vector-icons";
import { TouchableNativeFeedback, View } from "react-native";

export default function NewObject({ callback }) {
  return (
    <View className="absolute bottom-5 right-5 bg-blue-500 rounded-full p-4 shadow-lg">
      <TouchableNativeFeedback onPress={callback}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableNativeFeedback>
    </View>
  );
}
