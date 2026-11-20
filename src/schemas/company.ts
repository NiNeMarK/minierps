import * as z from "zod";

export const companySettingsSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  currency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code")
    .transform((value) => value.toUpperCase()),
  timezone: z.string().trim().min(1, "Timezone is required").max(64),
});

export type CompanySettingsInput = z.input<typeof companySettingsSchema>;
