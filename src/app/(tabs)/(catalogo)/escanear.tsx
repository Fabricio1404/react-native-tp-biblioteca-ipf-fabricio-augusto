import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { EntradaIsbnManual } from '@/components/EntradaIsbnManual';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { Colores, Espaciado, Radio, TamanioTexto } from '@/constants/tema';
import { useEscaner } from '@/hooks/useEscaner';
import { usePermiso } from '@/hooks/usePermiso';

const ALTO_CAMARA = 320;

function abrirPermisoCamara() {
  router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
}

export default function Escanear() {
  const [permiso, , consultarPermiso] = useCameraPermissions();
  const estado = usePermiso(permiso, consultarPermiso);
  const { aviso, alEscanear, abrirManual } = useEscaner();
  const previaMostrada = useRef(false);

  // La primera vez, antes del diálogo del sistema, se explica para qué es la cámara.
  useEffect(() => {
    if (estado === 'preguntable' && !previaMostrada.current) {
      previaMostrada.current = true;
      abrirPermisoCamara();
    }
  }, [estado]);

  return (
    <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
      <View style={styles.zonaCamara}>
        {estado === 'cargando' && <Cargando mensaje="Revisando el permiso de la cámara…" />}

        {estado === 'concedido' && (
          <CameraView
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
            onBarcodeScanned={alEscanear}
          />
        )}

        {estado === 'preguntable' && (
          <View style={styles.mensaje}>
            <Text style={styles.texto}>{TEXTOS_PERMISO.camara.beneficio}</Text>
            <Boton titulo="Usar la cámara" icono="camera" onPress={abrirPermisoCamara} />
          </View>
        )}

        {estado === 'bloqueado' && (
          <View style={styles.mensaje}>
            <Text style={styles.texto}>{TEXTOS_PERMISO.camara.bloqueado}</Text>
            <Boton
              titulo="Abrir Ajustes"
              icono="settings"
              variante="secundario"
              onPress={() => Linking.openSettings()}
            />
          </View>
        )}
      </View>

      {estado === 'concedido' && (
        <Text style={styles.ayuda}>Apuntá al código de barras de la contratapa del libro.</Text>
      )}

      {aviso && (
        <Text style={styles.aviso} accessibilityRole="alert">
          {aviso}
        </Text>
      )}

      <EntradaIsbnManual onAbrir={abrirManual} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    gap: Espaciado.lg,
    padding: Espaciado.lg,
  },
  zonaCamara: {
    height: ALTO_CAMARA,
    justifyContent: 'center',
    borderRadius: Radio.grande,
    overflow: 'hidden',
    backgroundColor: Colores.primarioSuave,
  },
  camara: {
    flex: 1,
  },
  mensaje: {
    alignItems: 'center',
    gap: Espaciado.lg,
    padding: Espaciado.xl,
  },
  texto: {
    fontSize: TamanioTexto.normal,
    color: Colores.texto,
    textAlign: 'center',
  },
  ayuda: {
    fontSize: TamanioTexto.chico,
    color: Colores.textoSecundario,
    textAlign: 'center',
  },
  aviso: {
    padding: Espaciado.md,
    borderRadius: Radio.medio,
    backgroundColor: Colores.alertaSuave,
    color: Colores.alerta,
    fontSize: TamanioTexto.normal,
    fontWeight: '600',
  },
});
