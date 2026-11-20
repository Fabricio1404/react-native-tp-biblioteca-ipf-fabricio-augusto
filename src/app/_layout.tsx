import { Stack } from 'expo-router';

import { BibliotecaProvider } from '@/context/biblioteca';

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <Stack />
    </BibliotecaProvider>
  );
}
