import z from "zod";

export const CANADIAN_PHONE_REGEX =
  /^(\+?1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || CANADIAN_PHONE_REGEX.test(val),
    "Format de téléphone invalide (Ex: 514-555-1234)"
  );
