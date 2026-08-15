import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import FullPageLoader from '../../components/FullPageLoader';

/** Legacy route — marketing landing now lives at `/`. 1:1 port of app/welcome/page.tsx. */
export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    navigation.replace('Landing');
  }, [navigation]);

  return <FullPageLoader />;
}
