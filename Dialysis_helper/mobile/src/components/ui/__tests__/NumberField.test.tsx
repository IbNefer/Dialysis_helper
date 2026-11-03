import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { OUT_OF_RANGE_MESSAGE } from '@/constants/copy';
import { colors } from '@/theme';

import { NumberField } from '../NumberField';

function borderColorOf(testID: string) {
  return StyleSheet.flatten(screen.getByTestId(testID).props.style).borderColor;
}

describe('NumberField', () => {
  it('muestra etiqueta, valor y unidad, y se lee con la unidad completa', async () => {
    await render(<NumberField label="Peso" unit="kg" value="68,4" testID="weight" />);
    expect(screen.getByText('Peso')).toBeOnTheScreen();
    expect(screen.getByText('kg')).toBeOnTheScreen();
    expect(screen.getByLabelText('Peso, en kilogramos')).toHaveDisplayValue('68,4');
  });

  it('avisa los cambios de texto', async () => {
    const onChangeText = jest.fn();
    await render(<NumberField label="Temperatura" unit="°C" onChangeText={onChangeText} />);
    await fireEvent.changeText(screen.getByLabelText('Temperatura, en grados Celsius'), '37,2');
    expect(onChangeText).toHaveBeenCalledWith('37,2');
  });

  it('usa el borde de enfoque al enfocar', async () => {
    await render(<NumberField label="Peso" unit="kg" testID="weight" />);
    expect(borderColorOf('weight-box')).toBe(colors.inputBorder);
    await fireEvent(screen.getByTestId('weight'), 'focus');
    expect(borderColorOf('weight-box')).toBe(colors.focusBorder);
  });

  it('fuera de rango: borde de atención, aviso visible y enlazado como pista', async () => {
    await render(
      <NumberField label="Presión alta" unit="mmHg" value="162" outOfRange testID="sys" />,
    );
    expect(borderColorOf('sys-box')).toBe(colors.attention);
    expect(screen.getByTestId('sys-notice')).toHaveTextContent(OUT_OF_RANGE_MESSAGE, {
      exact: false,
    });
    expect(screen.getByTestId('sys').props.accessibilityHint).toBe(OUT_OF_RANGE_MESSAGE);
  });

  it('puede ocultar el aviso cuando la pantalla muestra uno compartido', async () => {
    await render(
      <NumberField label="Presión alta" unit="mmHg" outOfRange showNotice={false} testID="sys" />,
    );
    expect(screen.queryByTestId('sys-notice')).toBeNull();
    expect(borderColorOf('sys-box')).toBe(colors.attention);
  });
});
