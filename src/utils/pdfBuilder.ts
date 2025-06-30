export default class PdfBuilder {
  /**
     * build an url string from a base64 string for display a pdf in the browser
     * @param base64 the base64 string of the pdf
     * @returns
     */
  static buildPdfContent(base64 : string) : string {
    return `data:application/pdf;base64,${base64}`;
  }

  /**
   * remove the url part from a base64 string
   * @param content the pdf
   * @returns a base64 string of the pdf
   */
  static parsePdfContent(content : string) : string {
    const split = content.split('data:application/pdf;base64,', 2);
    if (split.length < 2) {
        throw new Error('Invalid PDF content format');
    }
    return content.split('data:application/pdf;base64,', 2)[1]!;
  }
}
