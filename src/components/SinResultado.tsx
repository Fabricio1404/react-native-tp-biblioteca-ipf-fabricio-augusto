import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { ListaVacia } from '@/components/ListaVacia';
import { RUTA_CATALOGO } from '@/constants/rutas';
import { Espaciado } from '@/constants/tema';

type Props = {
  mensaje: string;
};

// Mensaje para datos que no existen, con un link de vuelta al Catálogo.
export function SinResultado({ mensaje }: Props) {
  return (
    <View style={styles.contenedor}>
      <ListaVacia mensaje={mensaje} icono="help-circle-outline" />
      <Link href={RUTA_CATALOGO} asChild>
        <Boton titulo="Ir al Catálogo" icono="library" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: 'center',
    gap: Espaciado.lg,
    padding: Espaciado.xl,
  },
});
