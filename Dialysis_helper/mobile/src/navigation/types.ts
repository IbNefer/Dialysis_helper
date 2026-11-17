import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { InvitationPreview } from '@/services/invitations/types';

export type AuthStackParamList = {
  /** Las cuentas de prueba (solo desarrollo) pueden rellenar el formulario. */
  Login: { email?: string; password?: string } | undefined;
  /** MOV-RF-001, paso 1: escribir y validar el código. */
  InvitationCode: { code?: string } | undefined;
  /** MOV-RF-001, paso 2: completar datos y crear la contraseña. */
  InvitationAccount: { invitation: InvitationPreview };
  /** Solo existe en desarrollo (__DEV__): pacientes sintéticos y códigos de prueba. */
  DevAccounts: undefined;
};

/** MOV-RF-002: con sesión pero sin consentimiento solo se puede estar aquí. */
export type ConsentStackParamList = {
  Consent: undefined;
};

export type RegisterStackParamList = {
  RegisterMenu: undefined;
  DialysisSession: undefined;
  Vitals: undefined;
  FluidsMeals: undefined;
  Symptoms: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Contacts: undefined;
  Settings: undefined;
  /** Solo existe en desarrollo (__DEV__). */
  ComponentCatalog: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  RegisterTab: NavigatorScreenParams<RegisterStackParamList> | undefined;
  AlertsTab: undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type ConsentScreenProps<T extends keyof ConsentStackParamList> = NativeStackScreenProps<
  ConsentStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type RegisterScreenProps<T extends keyof RegisterStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<RegisterStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<MainTabParamList>
>;

// Tipado global para useNavigation() sin genéricos.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends MainTabParamList {}
  }
}
