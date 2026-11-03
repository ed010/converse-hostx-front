const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string | null | undefined): boolean {
  return !!value && EMAIL_PATTERN.test(value.trim());
}

/** Receipt email given to a wallet button: undefined means "no receipt", anything else must be a valid address. */
export function isRecipientEmailOk(recipientEmail: string | undefined): boolean {
  return recipientEmail === undefined || isValidEmail(recipientEmail);
}
