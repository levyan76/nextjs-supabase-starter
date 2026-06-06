export const COMPANY_PROFILE = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Application métier",
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "Organisation",
  displayName: process.env.NEXT_PUBLIC_COMPANY_DISPLAY_NAME || "Organisation",
  contactEmail:
    process.env.NEXT_PUBLIC_COMPANY_CONTACT_EMAIL || "contact@example.com",
  contactPhone: process.env.NEXT_PUBLIC_COMPANY_CONTACT_PHONE || "000-000-0000",
  website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || "https://example.com",
  address: {
    line1: process.env.NEXT_PUBLIC_COMPANY_ADDRESS_LINE1 || "",
    city: process.env.NEXT_PUBLIC_COMPANY_CITY || "",
    province: process.env.NEXT_PUBLIC_COMPANY_PROVINCE || "QC",
    postalCode: process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE || "",
    country: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || "Canada",
  },
  branding: {
    primaryColor: process.env.NEXT_PUBLIC_BRAND_PRIMARY || "#009639",
    secondaryColor: process.env.NEXT_PUBLIC_BRAND_SECONDARY || "#000000",
    fontFamily:
      process.env.NEXT_PUBLIC_BRAND_FONT || "Raleway, Arial, sans-serif",
    logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || "/logo.png",
  },
} as const;

export const APP_NAME = COMPANY_PROFILE.appName;
export const COMPANY_DISPLAY_NAME = COMPANY_PROFILE.displayName;
export const CONFIDENTIALITY_NOTICE = `Document confidentiel – ${APP_NAME}. Reproduction interdite sans autorisation.`;
