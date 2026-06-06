import { renderToBuffer } from "@react-pdf/renderer";

/**
 * Renders a React-PDF document element to a Buffer.
 * This is the main entry point for server-side PDF generation.
 */
export async function generatePDF(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: React.ReactElement<any>
): Promise<Buffer> {
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
