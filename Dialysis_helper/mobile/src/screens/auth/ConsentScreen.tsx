import { useCallback, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import {
  AppText,
  Button,
  Checkbox,
  ConfirmDialog,
  GlassCard,
  InlineNotice,
  Screen,
  ScreenHeader,
  useToast,
} from '@/components/ui';
import type { ConsentScreenProps } from '@/navigation/types';
import { userMessage } from '@/services/errors';
import { useSession } from '@/services/session/SessionContext';
import { radii, spacing } from '@/theme';

/** Margen para dar por leído el final aunque falten unos píxeles por desplazar. */
export const READ_END_TOLERANCE = 24;

/**
 * MOV-RF-002 · Consentimiento informado.
 * "Acepto" se habilita solo después de llegar al final del documento y marcar la casilla.
 * Sin aceptar no se entra a la app: el navegador solo muestra esta pantalla.
 */
export function ConsentScreen(_props: ConsentScreenProps<'Consent'>) {
  const { services, user, acceptConsent, declineConsent } = useSession();
  const { showToast } = useToast();
  const document = services.consent.current;
  const [readToEnd, setReadToEnd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [declineVisible, setDeclineVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Final del documento medido desde el inicio del contenido desplazable, y alto visible.
  const documentEnd = useRef<number | null>(null);
  const viewportHeight = useRef(0);

  const markRead = useCallback(() => {
    setReadToEnd((already) => {
      if (!already) {
        AccessibilityInfo.announceForAccessibility(
          'Llegaste al final del documento. Ya puedes marcar la casilla.',
        );
      }
      return true;
    });
  }, []);

  /** Si todo el documento cabe en pantalla, ya está leído sin desplazar. */
  const checkFits = useCallback(() => {
    if (documentEnd.current === null || viewportHeight.current === 0) return;
    if (documentEnd.current <= viewportHeight.current + READ_END_TOLERANCE) markRead();
  }, [markRead]);

  const onDocumentLayout = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    documentEnd.current = y + height;
    checkFits();
  };

  const onScrollLayout = (event: LayoutChangeEvent) => {
    viewportHeight.current = event.nativeEvent.layout.height;
    checkFits();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (readToEnd || documentEnd.current === null) return;
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= documentEnd.current - READ_END_TOLERANCE) {
      markRead();
    }
  };

  const handleAccept = async () => {
    if (!readToEnd || !confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      await acceptConsent();
      showToast(`Gracias${user ? `, ${user.firstName}` : ''}. Ya puedes usar DP-Hogar`);
    } catch (caught) {
      setError(userMessage(caught));
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setDeclineVisible(false);
    await declineConsent();
    showToast('No aceptaste. Puedes hacerlo la próxima vez que entres');
  };

  return (
    <Screen
      withTabBar={false}
      testID="consent-screen"
      scrollViewProps={{
        onScroll,
        scrollEventThrottle: 100,
        onLayout: onScrollLayout,
        testID: 'consent-scroll',
      }}
    >
      <ScreenHeader
        title={document.title}
        subtitle={`Versión ${document.version} · ${document.dateLabel}`}
      />

      {!readToEnd && (
        <InlineNotice
          variant="pending"
          message="Léelo con calma hasta el final. Abajo podrás aceptar."
          testID="consent-read-hint"
        />
      )}

      <GlassCard
        radius={radii.cardLg}
        contentStyle={styles.document}
        onLayout={onDocumentLayout}
        testID="consent-document"
      >
        {document.sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <AppText variant="bodyLg" accessibilityRole="header">
              {index + 1}. {section.title}
            </AppText>
            <AppText color="textMuted">{section.body}</AppText>
          </View>
        ))}
        <AppText variant="caption" color="textMuted" align="center">
          Fin del documento
        </AppText>
      </GlassCard>

      <Checkbox
        label="Leí el consentimiento y entiendo para qué se usan mis datos"
        checked={confirmed}
        onChange={setConfirmed}
        disabled={!readToEnd}
        accessibilityHint={readToEnd ? undefined : 'Primero lee el documento hasta el final'}
        testID="consent-checkbox"
      />

      {error && <InlineNotice variant="attention" message={error} />}

      <Button
        label="Acepto"
        onPress={handleAccept}
        disabled={!readToEnd || !confirmed}
        loading={loading}
        accessibilityHint={
          readToEnd && confirmed ? undefined : 'Lee hasta el final y marca la casilla para aceptar'
        }
        testID="consent-accept"
      />
      <Button
        variant="secondary"
        label="No acepto"
        onPress={() => setDeclineVisible(true)}
        disabled={loading}
        testID="consent-decline"
      />

      <ConfirmDialog
        visible={declineVisible}
        title="Sin tu consentimiento no puedes usar la app"
        message={
          'DP-Hogar necesita tu permiso para guardar tus registros y compartirlos con tu equipo ' +
          'de salud. Tu atención médica no cambia. Si tienes dudas, habla con tu doctor: puedes ' +
          'aceptarlo la próxima vez que entres.'
        }
        confirmLabel="Salir sin aceptar"
        cancelLabel="Volver a leer"
        onConfirm={handleDecline}
        onCancel={() => setDeclineVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  document: { gap: spacing.lg },
  section: { gap: spacing.xs },
});
