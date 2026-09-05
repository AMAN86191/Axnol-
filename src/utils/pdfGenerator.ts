import { generatePDF } from 'react-native-html-to-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Alert, Platform } from 'react-native';
import i18n from '../i18n';

/**
 * Generate a PDF file and return its on-disk file path without triggering
 * the OS download/preview. Useful when you need to share the file directly.
 */
export const generatePdfFile = async (htmlContent: string, fileName: string = 'Document'): Promise<string> => {
  const options = {
    html: htmlContent,
    fileName: fileName,
    directory: 'Documents',
  };

  const file = await generatePDF(options);

  if (!file.filePath) {
    throw new Error('PDF generation returned no file path');
  }

  return file.filePath;
};

export const generateAndDownloadPDF = async (htmlContent: string, fileName: string = 'Document') => {
  try {
    const filePath = await generatePdfFile(htmlContent, fileName);

    if (Platform.OS === 'android') {
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const downloadPath = `${dirs.DownloadDir}/${fileName}_${Date.now()}.pdf`;

      // Copy from internal app storage to public Downloads directory
      await ReactNativeBlobUtil.fs.cp(filePath, downloadPath);

      // Add to Android Download Manager to show OS-level notification
      ReactNativeBlobUtil.android.addCompleteDownload({
        title: `${fileName}.pdf`,
        description: 'Certificate downloaded successfully. Tap to open.',
        mime: 'application/pdf',
        path: downloadPath,
        showNotification: true,
      });

    } else {
      // iOS Fallback - preview document directly
      ReactNativeBlobUtil.ios.previewDocument(filePath);
    }
  } catch (error) {
    console.log('Error generating PDF:', error);
    Alert.alert(i18n.t('common.error'), 'Failed to generate PDF. Please try again.');
  }
};
