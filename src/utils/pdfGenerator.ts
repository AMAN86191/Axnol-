import { generatePDF } from 'react-native-html-to-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Alert, Platform } from 'react-native';

export const generateAndDownloadPDF = async (htmlContent: string, fileName: string = 'Document') => {
  try {
    let options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Documents',
    };

    const file = await generatePDF(options);
    
    if (file.filePath) {
      if (Platform.OS === 'android') {
        const dirs = ReactNativeBlobUtil.fs.dirs;
        const downloadPath = `${dirs.DownloadDir}/${fileName}_${Date.now()}.pdf`;

        // Copy from internal app storage to public Downloads directory
        await ReactNativeBlobUtil.fs.cp(file.filePath, downloadPath);

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
        ReactNativeBlobUtil.ios.previewDocument(file.filePath);
      }
    }
  } catch (error) {
    console.log('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};
