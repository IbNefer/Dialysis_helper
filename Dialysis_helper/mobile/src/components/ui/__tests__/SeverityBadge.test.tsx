import { render, screen } from '@testing-library/react-native';

import { SeverityBadge } from '../SeverityBadge';

describe('SeverityBadge', () => {
  it.each([
    ['info', 'Informativa'],
    ['attention', 'Atención'],
    ['urgent', 'Urgente'],
  ] as const)('la severidad %s siempre muestra el texto "%s"', async (severity, text) => {
    await render(<SeverityBadge severity={severity} />);
    expect(screen.getByText(text)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Severidad: ${text}`)).toBeOnTheScreen();
  });
});
