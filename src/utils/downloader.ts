class Downloader {
  /**
 * downloads a pdf file from a base64 string
 * @param base64string the base64 string
 * @param filename the filename without extension
 */
  public static downloadPdf(base64string: string, filename : string) {
    Downloader.downloadFile(base64string, filename, 'pdf');
  }

  /**
   * downloads a file from a base64 string
   * @param base64string the base64 string
   * @param filename the filename without extension
   * @param extension the extension of the file
   */

  public static downloadFile(base64string: string, filename : string, extension : string) {
    const element = document.createElement('a');
    const val = Downloader.toBinary(base64string);
    const url = window.URL.createObjectURL(val);
    element.setAttribute('href', url);
    element.setAttribute('download', `${filename}.${extension}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  public static downloadXMLString(xmlData: Blob, filename : string) {
    this.downloadString(xmlData, filename);
  }

  /**
   * downloads a csv file from blob
   * @param csvData the csd data
   * @param filename the filename
   */
  public static downloadString(csvData: Blob, filename : string) {
    const element = document.createElement('a');
    const url = window.URL.createObjectURL(csvData);
    element.setAttribute('href', url);
    element.setAttribute('download', `${filename}`);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  /**
   * converts
   * @param b64Data the base64 string
   * @param contentType the content type which to return
   * @param sliceSize the slice size
   * @returns an array of bytes
   */
  public static toBinary(b64Data : string, contentType = 'application/octet-stream', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
       
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
}

export default Downloader;
