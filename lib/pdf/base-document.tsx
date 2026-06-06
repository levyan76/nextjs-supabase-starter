import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import { PDFHeader } from "./header";
import { PDFFooter } from "./footer";
import { baseStyles } from "./base-styles";
import { APP_NAME } from "../config/company-profile";

interface BaseDocumentProps {
  title: string;
  date?: string;
  documentNumber?: string;
  children?: React.ReactNode;
}

/**
 * Base PDF document wrapper.
 * Provides branded header, footer with page numbers, and A4 page setup.
 */
export function BaseDocument({
  title,
  date,
  documentNumber,
  children,
}: BaseDocumentProps) {
  return (
    <Document
      title={title}
      author={APP_NAME}
      creator={APP_NAME}
      producer={APP_NAME}
    >
      <Page size="A4" style={baseStyles.page}>
        <PDFHeader title={title} date={date} documentNumber={documentNumber} />
        {children}
        <PDFFooter />
      </Page>
    </Document>
  );
}
