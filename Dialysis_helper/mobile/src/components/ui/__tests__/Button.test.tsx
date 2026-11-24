import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it.each(['primary', 'secondary', 'danger', 'dangerSoft'] as const)(
    'muestra la variante %s como botón accesible',
    async (variant) => {
      await render(<Button variant={variant} label="Guardar registro" />);
      expect(screen.getByRole('button', { name: 'Guardar registro' })).toBeOnTheScreen();
    },
  );

  it('llama a onPress al tocarlo', async () => {
    const onPress = jest.fn();
    await render(<Button label="Iniciar sesión" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no responde cuando está deshabilitado', async () => {
    const onPress = jest.fn();
    await render(<Button label="Guardar" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('muestra el indicador de carga y se anuncia como ocupado', async () => {
    const onPress = jest.fn();
    await render(<Button label="Guardar" onPress={onPress} loading testID="save" />);
    expect(screen.getByTestId('save-loading')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeBusy();
    await fireEvent.press(screen.getByRole('button', { name: 'Guardar' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
