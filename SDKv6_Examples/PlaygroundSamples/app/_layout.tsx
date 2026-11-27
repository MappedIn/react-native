import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

// A refresh has no history, so the stack would hide the back button. Keep the
// sample list behind every demo so back always returns there.
export const unstable_settings = { anchor: 'index' };

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<StatusBar style="auto" />
			<Stack
				screenOptions={{
					// iOS 26 treats an unset header as transparent and draws the screen under it.
					// Tint stays dark so the title and back button remain readable on the white bar in dark mode.
					headerTransparent: false,
					headerStyle: { backgroundColor: '#ffffff' },
					headerTintColor: '#111827',
				}}
			>
				<Stack.Screen name="index" options={{ title: 'Mappedin SDK Samples' }} />
			</Stack>
		</GestureHandlerRootView>
	);
}
