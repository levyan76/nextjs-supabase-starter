import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { baseStyles } from "./base-styles";
import path from "path";
import fs from "fs";
import { formatDate } from "../date-utils";
import { APP_NAME } from "../config/company-profile";

interface PDFHeaderProps {
  title: string;
  date?: string;
  documentNumber?: string;
}

// Load logo as base64 data URI at module level.
// Resolve via NEXT_PUBLIC_LOGO_PATH (env), fallback to /logo.png.
function getLogoDataUri(): string | null {
  try {
    const relativePath = process.env.NEXT_PUBLIC_LOGO_PATH ?? "/logo.png";
    const logoPath = path.resolve(
      process.cwd(),
      "public" +
        (relativePath.startsWith("/") ? relativePath : "/" + relativePath)
    );
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export function PDFHeader({ title, date, documentNumber }: PDFHeaderProps) {
  const logoUri = getLogoDataUri();
  const displayDate = formatDate(date, "LLL");

  return (
    <View style={baseStyles.headerContainer} fixed>
      <View style={baseStyles.headerLeft}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> renders to PDF, no a11y target */}
        {logoUri && <Image src={logoUri} style={baseStyles.headerLogo} />}
        <Text style={baseStyles.headerCompanyName}>{APP_NAME}</Text>
      </View>
      <View style={baseStyles.headerRight}>
        <Text style={baseStyles.headerDocTitle}>{title}</Text>
        <Text style={baseStyles.headerDocDate}>{displayDate}</Text>
        {documentNumber && (
          <Text style={baseStyles.headerDocNumber}>N° {documentNumber}</Text>
        )}
      </View>
    </View>
  );
}
