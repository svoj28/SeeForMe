import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCameraPermissions } from 'expo-camera';
import MainScreen from './src/screens/MainScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import { SettingsProvider, useSettings } from './src/settingsContext';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <StatusBar style="light" />
        <Screens />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function Screens() {
  const [permission, requestPermission] = useCameraPermissions();
  const [settings, update] = useSettings();
  // First launch: show the tutorial. Finished or skipped is remembered.
  const [showTutorial, setShowTutorial] = useState(() => !settings.tutorialDone && !settings.tutorialSkipped);
  // What the main screen says when it opens:
  //  'short'   returning user, or just finished the tutorial
  //  'skipped' just skipped: say how to get the tutorial back, then the full layout
  const [greeting, setGreeting] = useState('short');

  const finishTutorial = (how) => {
    update(how === 'done' ? { tutorialDone: true } : { tutorialSkipped: true });
    setGreeting(how === 'done' ? 'short' : 'skipped');
    setShowTutorial(false);
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  if (!permission.granted) return <PermissionScreen canAskAgain={permission.canAskAgain} onRequest={requestPermission} />;
  if (showTutorial) return <TutorialScreen onFinish={finishTutorial} />;
  return <MainScreen greeting={greeting} onStartTutorial={() => setShowTutorial(true)} />;
}
