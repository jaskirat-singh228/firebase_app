export type TDialogOptions = {
  title: string;
  message: string;
  onConfirm?: () => void;
  onDismiss?: () => void;
  isConfirmDestructive?: boolean;
  isDismissDestructive?: boolean;
  actionType?: 'success' | 'error' | 'info' | 'warning';
};

// Add global type declarations for RNFB properties
declare global {
  // eslint-disable-next-line no-var
  var RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS: boolean | undefined;
  // eslint-disable-next-line no-var
  var RNFB_MODULAR_DEPRECATION_STRICT_MODE: boolean | undefined;
}
