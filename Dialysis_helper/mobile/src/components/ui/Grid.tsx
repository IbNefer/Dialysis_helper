import { Children, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { spacing } from '@/theme';

/** Con la fuente del sistema a este tamaño o más, la grilla pasa a una sola columna. */
export const GRID_COLLAPSE_FONT_SCALE = 1.3;

type GridProps = {
  children: ReactNode;
  columns?: number;
  gap?: number;
};

/**
 * Grilla simple de columnas iguales; las filas incompletas conservan el ancho de columna.
 * Con fuente grande se apila en una columna para que el texto no se parta a mitad de palabra.
 */
export function Grid({ children, columns = 2, gap = spacing.sm }: GridProps) {
  const { fontScale } = useWindowDimensions();
  const cols = fontScale >= GRID_COLLAPSE_FONT_SCALE ? 1 : columns;
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));

  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        <View key={r} style={[styles.row, { gap }]}>
          {row}
          {Array.from({ length: cols - row.length }, (_, i) => (
            <View key={`spacer-${i}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1 },
});
