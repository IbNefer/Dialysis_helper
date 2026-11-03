import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  Button,
  GlassCard,
  Grid,
  InlineNotice,
  NumberField,
  OfflineHint,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { OUT_OF_RANGE_MESSAGE } from '@/constants/copy';
import { mockVitals } from '@/constants/mockData';
import type { RegisterScreenProps } from '@/navigation/types';
import { spacing } from '@/theme';
import { demoVitalRanges, isOutOfRange } from '@/utils/ranges';

const FAKE_SAVE_MS = 800;

/**
 * M3 · Signos vitales y peso. Maqueta: valida rangos de ejemplo en el cliente y simula el guardado.
 * No envía nada a ningún servidor.
 */
export function VitalsScreen({ navigation }: RegisterScreenProps<'Vitals'>) {
  const [weight, setWeight] = useState(mockVitals.weight);
  const [systolic, setSystolic] = useState(mockVitals.systolic);
  const [diastolic, setDiastolic] = useState(mockVitals.diastolic);
  const [temperature, setTemperature] = useState(mockVitals.temperature);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const systolicOut = isOutOfRange(systolic, demoVitalRanges.systolic);
  const diastolicOut = isOutOfRange(diastolic, demoVitalRanges.diastolic);

  const edit = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    timer.current = setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, FAKE_SAVE_MS);
  };

  return (
    <Screen withTabBar={false} testID="vitals-screen">
      <ScreenHeader
        title="Signos vitales y peso"
        subtitle={mockVitals.timeLabel}
        onBack={() => navigation.goBack()}
      />

      <GlassCard contentStyle={styles.form}>
        <NumberField
          label="Peso"
          unit="kg"
          value={weight}
          onChangeText={edit(setWeight)}
          outOfRange={isOutOfRange(weight, demoVitalRanges.weight)}
          testID="field-weight"
        />
        <Grid>
          <NumberField
            label="Presión alta"
            unit="mmHg"
            value={systolic}
            onChangeText={edit(setSystolic)}
            outOfRange={systolicOut}
            showNotice={false}
            testID="field-systolic"
          />
          <NumberField
            label="Presión baja"
            unit="mmHg"
            value={diastolic}
            onChangeText={edit(setDiastolic)}
            outOfRange={diastolicOut}
            showNotice={false}
            testID="field-diastolic"
          />
        </Grid>
        {(systolicOut || diastolicOut) && (
          <InlineNotice
            variant="attention"
            title="Atención."
            message={OUT_OF_RANGE_MESSAGE}
            testID="pressure-notice"
          />
        )}
        <NumberField
          label="Temperatura"
          unit="°C"
          value={temperature}
          onChangeText={edit(setTemperature)}
          outOfRange={isOutOfRange(temperature, demoVitalRanges.temperature)}
          testID="field-temperature"
        />
      </GlassCard>

      <Button label="Guardar registro" onPress={handleSave} loading={saving} testID="save" />
      {saved && (
        <InlineNotice
          variant="info"
          title="Guardado de prueba."
          message="En esta versión todavía no se envía a tu equipo."
          testID="saved-notice"
        />
      )}
      <OfflineHint />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
