import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { baseStyles } from "./base-styles";

import { CONFIDENTIALITY_NOTICE } from "../config/company-profile";

export function PDFFooter() {
  return (
    <View style={baseStyles.footerContainer} fixed>
      <Text style={baseStyles.footerConfidentiality}>
        {CONFIDENTIALITY_NOTICE}
      </Text>
      <Text
        style={baseStyles.footerPageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}
