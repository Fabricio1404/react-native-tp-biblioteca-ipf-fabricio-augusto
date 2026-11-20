import { FlatList, StyleSheet, View } from 'react-native';

import { ItemEspera } from '@/components/ItemEspera';
import { ItemPrestamo } from '@/components/ItemPrestamo';
import { ListaVacia } from '@/components/ListaVacia';
import { TarjetaAviso } from '@/components/TarjetaAviso';
import { TituloSeccion } from '@/components/TituloSeccion';
import { Colores, Espaciado } from '@/constants/tema';
import { useBiblioteca } from '@/hooks/useBiblioteca';

export default function MisReservas() {
  const { prestamos, misEsperas, avisos, descartarAviso } = useBiblioteca();

  return (
    <FlatList
      style={styles.lista}
      data={prestamos}
      keyExtractor={(prestamo) => prestamo.isbn}
      renderItem={({ item }) => <ItemPrestamo prestamo={item} />}
      contentContainerStyle={styles.contenido}
      ListHeaderComponent={
        <View style={styles.bloque}>
          {avisos.map((aviso) => (
            <TarjetaAviso key={aviso.id} aviso={aviso} onDescartar={() => descartarAviso(aviso.id)} />
          ))}
          <TituloSeccion>Mis préstamos</TituloSeccion>
        </View>
      }
      ListEmptyComponent={
        <ListaVacia mensaje="No tenés préstamos activos. Reservá un libro desde el Catálogo." />
      }
      ListFooterComponent={
        <View style={styles.bloque}>
          <TituloSeccion>En lista de espera</TituloSeccion>
          {misEsperas.length === 0 ? (
            <ListaVacia mensaje="No estás esperando ningún libro." icono="time-outline" />
          ) : (
            misEsperas.map((espera) => (
              <ItemEspera key={espera.isbn} isbn={espera.isbn} posicion={espera.posicion} />
            ))
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    backgroundColor: Colores.fondo,
  },
  contenido: {
    gap: Espaciado.sm,
    padding: Espaciado.lg,
  },
  bloque: {
    gap: Espaciado.sm,
  },
});
