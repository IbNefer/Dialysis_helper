import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AlertCard,
  AppIcon,
  AppLogo,
  AppText,
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  FilterChips,
  FloatingTabBar,
  GlassCard,
  Grid,
  IconButton,
  InlineNotice,
  ListItem,
  LoadingView,
  MenuTile,
  NumberField,
  OfflineHint,
  ProgressBar,
  Screen,
  ScreenHeader,
  SeverityBadge,
  StatCard,
  TextField,
  type IconName,
} from '@/components/ui';
import { OUT_OF_RANGE_MESSAGE } from '@/constants/copy';
import type { ProfileScreenProps } from '@/navigation/types';
import { colors, radii, spacing, typography, type TypographyVariant } from '@/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const icons: IconName[] = [
  'home',
  'add-circle',
  'notifications',
  'person',
  'water',
  'heart',
  'cafe',
  'sad',
  'call',
  'warning',
  'checkmark-circle',
  'time',
];

const tabRoutes = [
  { key: 'home', name: 'HomeTab', title: 'Inicio', icon: 'home' },
  { key: 'register', name: 'RegisterTab', title: 'Registrar', icon: 'add-circle' },
  { key: 'alerts', name: 'AlertsTab', title: 'Alertas', icon: 'notifications' },
  { key: 'profile', name: 'ProfileTab', title: 'Perfil', icon: 'person' },
] as const;

/** Props mínimas para dibujar la barra fuera de un navegador (solo vista previa). */
function previewTabBarProps(index: number): BottomTabBarProps {
  const descriptors = Object.fromEntries(
    tabRoutes.map((route) => [
      route.key,
      {
        options: {
          title: route.title,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <AppIcon name={route.icon} color={color} size={size} />
          ),
        },
      },
    ]),
  );
  return {
    state: { key: 'preview', index, routes: tabRoutes.map(({ key, name }) => ({ key, name })) },
    descriptors,
    navigation: { emit: () => ({ defaultPrevented: true }), dispatch: () => undefined },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as BottomTabBarProps;
}

const swatches = [
  'bg',
  'text',
  'textMuted',
  'accentStart',
  'accentEnd',
  'accentGreen',
  'accentBlue',
  'success',
  'info',
  'attention',
  'urgent',
] as const;

/** Pantalla de desarrollo con todos los componentes base y sus variantes. */
export function ComponentCatalogScreen({ navigation }: ProfileScreenProps<'ComponentCatalog'>) {
  const [chip, setChip] = useState<'all' | 'urgent' | 'attention' | 'info'>('all');
  const [dialog, setDialog] = useState<'primary' | 'danger' | null>(null);
  const [text, setText] = useState('');
  const [number, setNumber] = useState('162');

  return (
    <Screen withTabBar={false} testID="catalog-screen">
      <ScreenHeader
        title="Catálogo de componentes"
        subtitle="Solo en desarrollo"
        onBack={() => navigation.goBack()}
      />

      <Section title="Tipografía">
        {(Object.keys(typography) as TypographyVariant[]).map((variant) => (
          <AppText key={variant} variant={variant}>
            {variant} · Diálisis en casa
          </AppText>
        ))}
      </Section>

      <Section title="Colores">
        <View style={styles.swatches}>
          {swatches.map((token) => (
            <View key={token} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: colors[token] }]} />
              <AppText variant="caption" color="textMuted">
                {token}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Íconos rellenos">
        <View style={styles.swatches}>
          {icons.map((name) => (
            <View key={name} style={styles.swatch}>
              <AppIcon name={name} />
              <AppText variant="caption" color="textMuted">
                {name}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Button">
        <Button label="Primario" />
        <Button variant="secondary" label="Secundario" icon="happy" />
        <Button variant="danger" label="Peligro" icon="call" />
        <Button variant="dangerSoft" label="Peligro suave" icon="call" />
        <Button label="Cargando" loading />
        <Button variant="secondary" label="Deshabilitado" disabled />
        <Button label="Ancho automático" fullWidth={false} />
      </Section>

      <Section title="IconButton">
        <View style={styles.row}>
          <IconButton icon="notifications" accessibilityLabel="Alertas" />
          <IconButton icon="notifications" accessibilityLabel="Alertas sin leer" badge />
          <IconButton icon="chevron-back" accessibilityLabel="Volver" />
        </View>
      </Section>

      <Section title="Avatar y logo">
        <View style={styles.row}>
          <Avatar initials="MR" name="María Rodríguez" />
          <Avatar initials="JP" name="Juan Pérez" size={72} />
          <AppLogo />
        </View>
      </Section>

      <Section title="GlassCard">
        {(['default', 'subtle', 'pending', 'urgent', 'tabBar'] as const).map((tone) => (
          <GlassCard key={tone} tone={tone}>
            <AppText>Tono {tone}</AppText>
          </GlassCard>
        ))}
      </Section>

      <Section title="StatCard">
        <Grid>
          <StatCard
            label="Peso"
            value="68,4"
            unit="kg"
            change="−0,3 vs. ayer"
            changeTone="positive"
          />
          <StatCard label="Presión" value="128/82" change="mmHg · 8:10 a. m." />
          <StatCard
            label="Líquidos"
            value="600"
            unit="/ 1000 ml"
            change="Límite de tu doctor"
            changeTone="doctorNote"
          />
        </Grid>
      </Section>

      <Section title="ProgressBar">
        <ProgressBar progress={0} accessibilityLabel="Progreso 0" />
        <ProgressBar progress={0.5} accessibilityLabel="Progreso 50" />
        <ProgressBar progress={1} accessibilityLabel="Progreso 100" />
      </Section>

      <Section title="MenuTile">
        <Grid>
          <MenuTile icon="water" tone="blue" title="Tono azul" description="Descripción corta" />
          <MenuTile icon="heart" tone="green" title="Tono verde" description="Descripción corta" />
        </Grid>
      </Section>

      <Section title="ListItem">
        <ListItem icon="call" title="Contactos" description="Con descripción" />
        <ListItem icon="settings" title="Sin descripción" />
      </Section>

      <Section title="TextField y NumberField">
        <TextField label="Texto" placeholder="Escribe aquí" value={text} onChangeText={setText} />
        <NumberField label="Normal" unit="kg" value="68,4" />
        <NumberField
          label="Fuera de rango (edítalo)"
          unit="mmHg"
          value={number}
          onChangeText={setNumber}
          outOfRange={Number(number) > 140}
        />
      </Section>

      <Section title="InlineNotice">
        <InlineNotice variant="info" message="Aviso informativo." />
        <InlineNotice variant="attention" title="Atención." message={OUT_OF_RANGE_MESSAGE} />
        <InlineNotice variant="urgent" title="Urgente." message="Contacta a tu equipo ahora." />
        <InlineNotice variant="pending" message="Pendiente hoy: tu peso de la noche" />
      </Section>

      <Section title="SeverityBadge">
        <View style={styles.row}>
          <SeverityBadge severity="info" />
          <SeverityBadge severity="attention" />
          <SeverityBadge severity="urgent" />
        </View>
      </Section>

      <Section title="FilterChips">
        <FilterChips
          accessibilityLabel="Ejemplo de filtros"
          value={chip}
          onChange={setChip}
          options={[
            { key: 'all', label: 'Todas' },
            { key: 'urgent', label: 'Urgentes' },
            { key: 'attention', label: 'Atención' },
            { key: 'info', label: 'Info' },
          ]}
        />
      </Section>

      <Section title="AlertCard">
        <AlertCard severity="urgent" time="Hace 5 min" message="Alerta urgente de ejemplo." />
        <AlertCard severity="attention" time="Hoy, 8:10 p. m." message="Alerta de atención." />
        <AlertCard severity="info" time="Hoy, 1:45 p. m." message="Alerta informativa." />
        <AlertCard severity="info" time="Ayer" message="Alerta ya leída." read />
      </Section>

      <Section title="FloatingTabBar">
        {[0, 2].map((index) => (
          <View key={index} style={styles.tabBarPreview}>
            <FloatingTabBar {...previewTabBarProps(index)} />
          </View>
        ))}
      </Section>

      <Section title="EmptyState">
        <EmptyState
          icon="checkmark-circle"
          title="Sin alertas"
          description="Cuando haya alertas, las verás aquí."
          actionLabel="Acción opcional"
        />
      </Section>

      <Section title="LoadingView">
        <GlassCard>
          <LoadingView fullScreen={false} />
        </GlassCard>
      </Section>

      <Section title="ConfirmDialog">
        <Button variant="secondary" label="Abrir diálogo" onPress={() => setDialog('primary')} />
        <Button
          variant="dangerSoft"
          label="Abrir diálogo de peligro"
          onPress={() => setDialog('danger')}
        />
        <ConfirmDialog
          visible={dialog !== null}
          tone={dialog ?? 'primary'}
          title={dialog === 'danger' ? '¿Borrar registro?' : '¿Guardar cambios?'}
          message="Ejemplo del diálogo de confirmación."
          confirmLabel={dialog === 'danger' ? 'Borrar' : 'Guardar'}
          onConfirm={() => setDialog(null)}
          onCancel={() => setDialog(null)}
        />
      </Section>

      <Section title="OfflineHint">
        <OfflineHint />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginTop: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: { alignItems: 'center', gap: spacing.xxs, width: 88 },
  swatchColor: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tabBarPreview: { height: 72 + 24 + 34 },
});
