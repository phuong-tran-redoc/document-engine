import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const urlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = ((control.value as string | null) ?? '').trim();

  if (!value) return null;

  // Allow http, https, mailto, tel. Add protocol if missing during submit; here just a loose check.
  const hasAllowedScheme = /^(https?:|mailto:|tel:)/i.test(value);
  const looksLikeDomain = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/.test(value);

  if (hasAllowedScheme || looksLikeDomain) return null;

  return { url: true } as ValidationErrors;
};
