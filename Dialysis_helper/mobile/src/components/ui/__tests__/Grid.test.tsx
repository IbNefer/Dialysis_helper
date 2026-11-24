import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Grid } from '../Grid';

const mockFontScale = { value: 1 };

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 2, fontScale: mockFontScale.value }),
}));

async function rowsOf() {
  await render(
    <Grid>
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
      <Text>D</Text>
    </Grid>,
  );
  // El padre directo de cada celda es su fila.
  const parents = new Set(['A', 'B', 'C', 'D'].map((t) => screen.getByText(t).parent));
  return parents.size;
}

describe('Grid', () => {
  it('reparte en 2 columnas con fuente normal', async () => {
    mockFontScale.value = 1;
    expect(await rowsOf()).toBe(2);
  });

  it('se apila en una columna con fuente grande', async () => {
    mockFontScale.value = 1.5;
    expect(await rowsOf()).toBe(4);
  });
});
