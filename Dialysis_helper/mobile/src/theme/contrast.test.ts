import { composite, contrastRatio } from '@/utils/contrast';

import { colors, glass } from '.';

const onGlass = composite(colors.glass, colors.bg);
const onSubtle = composite(colors.glassSubtle, colors.bg);
const onAndroidGlass = composite(colors.glass, composite(glass.androidFallback, colors.bg));

// Pares texto/fondo que usan los componentes. Mínimo WCAG AA para texto normal: 4.5:1.
const pairs: [name: string, fg: string, bg: string][] = [
  ['text sobre fondo', colors.text, colors.bg],
  ['textMuted sobre fondo', colors.textMuted, colors.bg],
  ['text sobre vidrio', colors.text, onGlass],
  ['textMuted sobre vidrio', colors.textMuted, onGlass],
  ['textMuted sobre vidrio Android', colors.textMuted, onAndroidGlass],
  ['textMuted sobre vidrio sutil', colors.textMuted, onSubtle],
  ['onAccent sobre inicio del degradado', colors.onAccent, colors.accentStart],
  ['onAccent sobre fin del degradado', colors.onAccent, colors.accentEnd],
  ['onUrgent sobre urgent', colors.onUrgent, colors.urgent],
  [
    'accentGreen sobre accentGreenSoft',
    colors.accentGreen,
    composite(colors.accentGreenSoft, colors.bg),
  ],
  ['accentBlue sobre vidrio', colors.accentBlue, onGlass],
  ['success sobre vidrio', colors.success, onGlass],
  ['info sobre infoBg', colors.info, composite(colors.infoBg, onGlass)],
  ['attention sobre attentionBg', colors.attention, composite(colors.attentionBg, onGlass)],
  ['urgentTextSoft sobre urgentBg', colors.urgentTextSoft, composite(colors.urgentBg, colors.bg)],
  ['text sobre tabBarBg', colors.text, composite(colors.tabBarBg, colors.bg)],
];

describe('contraste de los tokens', () => {
  it.each(pairs)('%s cumple 4.5:1', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
