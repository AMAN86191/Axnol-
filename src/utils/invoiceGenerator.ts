import {generatePDF} from 'react-native-html-to-pdf';
import {Platform, PermissionsAndroid} from 'react-native';
import {formatOrderDateTime} from '../features/orders/orderUtils';
import notifee, {AndroidImportance} from '@notifee/react-native';
import FileViewer from 'react-native-file-viewer';
import RNBlobUtil from 'react-native-blob-util';

const getLogoUri = () => {
  return 'https://axnol.tambimotors.com/web-assets/axnol-images/logo/Axnol-dark-Logo.png';
};

const formatInvoicePrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', {maximumFractionDigits: 2})}`;

const capitalizeFirstLetter = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, character => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

const buildInvoiceHtml = (order: any) => {
  const logoUri = getLogoUri();
  const orderDate = order?.createdAt
    ? formatOrderDateTime(order.createdAt)
    : order?.orderDate
    ? formatOrderDateTime(order.orderDate)
    : '';
  const orderNo = order?.orderNumber || order?.id || '';
  const items = order?.items || [];
  const calculatedSubtotal = items.reduce((sum: number, item: any) => {
    const qty = Number(item?.qty || item?.quantity || 1);
    const price = Number(item?.unitPrice || item?.price || 0);
    const line = Number(item?.lineTotal || qty * price);
    return sum + line;
  }, 0);
  const subtotal = Number(order?.subtotal ?? calculatedSubtotal);
  const gstRate = Number(order?.gstRate ?? order?.gst_rate ?? 0);
  const gstAmount = Number(order?.gstAmount ?? order?.gst_amount ?? 0);
  const total = Number(order?.totalAmount ?? order?.total_amount ?? order?.total ?? subtotal + gstAmount);
  const address = [
    order?.companyName,
    order?.address,
    order?.city,
    order?.state,
    order?.pincode,
    order?.phone ? `Phone: ${order.phone}` : '',
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(', ');
  const status = String(order?.status || 'N/A');

  const itemsHtml = items
    .map((item: any, idx: number) => {
      const name = escapeHtml(item?.productName || item?.name || 'Product');
      const qty = Number(item?.qty || item?.quantity || 1);
      const unitPrice = Number(item?.unitPrice || item?.price || 0);
      const lineTotal = Number(item?.lineTotal || qty * unitPrice);
      const size = escapeHtml(item?.size || item?.unit || '');
      return `
        <tr>
          <td class="td center">${idx + 1}</td>
          <td class="td">${name}${size ? '<br/><span class="muted">' + size + '</span>' : ''}</td>
          <td class="td center">${qty}</td>
          <td class="td right">${formatInvoicePrice(unitPrice)}</td>
          <td class="td right bold">${formatInvoicePrice(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Helvetica', Arial, sans-serif; }
          body { padding: 16px; background-color: #eef2f0; color: #1e293b; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice { background-color: #ffffff; border: 1px solid #d9e3df; border-top: 4px solid #0f766e; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .logo { height: 60px; }
          .company { text-align: right; }
          .company-name { font-size: 18px; font-weight: bold; color: #0f766e; margin-bottom: 4px; }
          .company-info { color: #64748b; line-height: 1.6; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; background: #f8fafc; padding: 12px; border-radius: 4px; }
          .info-title { font-weight: bold; color: #0f766e; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; }
          .info-text { line-height: 1.6; color: #334155; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .th { background: #0f766e; color: white; padding: 10px 8px; text-align: left; font-weight: bold; font-size: 10px; text-transform: uppercase; }
          .th.center { text-align: center; }
          .th.right { text-align: right; }
          .td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .td.center { text-align: center; }
          .td.right { text-align: right; }
          .td.bold { font-weight: bold; }
          .muted { color: #64748b; font-size: 10px; }
          .totals { margin-left: auto; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .total-row.grand { border-bottom: none; border-top: 2px solid #0f766e; padding-top: 12px; margin-top: 4px; font-size: 13px; font-weight: bold; color: #0f766e; }
          .footer { margin-top: 40px; text-align: center; color: #64748b; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <main class="invoice">
        <div class="header">
          <img src="${logoUri}" class="logo" />
         
        </div>
        <div class="title">INVOICE</div>
        <div class="info-row">
          <div class="info-box">
            <div class="info-title">Bill To</div>
            <div class="info-text">
          ${address || '-'}
          ${order?.remark ? `<br/><strong>Remark:</strong> ${escapeHtml(order.remark)}` : ''}
            </div>
          </div>
          <div class="info-box">
            <div class="info-title">Invoice Details</div>
            <div class="info-text">
              <strong>Invoice No:</strong> ${escapeHtml(orderNo)}<br/>
              <strong>Order No:</strong> ${escapeHtml(order?.id || orderNo)}<br/>
              <strong>Date:</strong> ${escapeHtml(orderDate)}<br/>
              <strong>Status:</strong> ${escapeHtml(capitalizeFirstLetter(status))}<br/>
              <strong>Payment Status:</strong> ${escapeHtml(capitalizeFirstLetter(String(order?.paymentStatus || order?.payment_status || 'N/A')))}
            </div>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th class="th center" style="width: 40px;">#</th>
              <th class="th">Item</th>
              <th class="th center" style="width: 60px;">Qty</th>
              <th class="th right" style="width: 100px;">Unit Price</th>
              <th class="th right" style="width: 100px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatInvoicePrice(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>GST (${gstRate}%)</span>
            <span>${formatInvoicePrice(gstAmount)}</span>
          </div>
          <div class="total-row grand">
            <span>Total Amount</span>
            <span>${formatInvoicePrice(total)}</span>
          </div>
        </div>
        </main>
      </body>
    </html>
  `;
};

export const downloadInvoice = async (order: any) => {
  try {
    const html = buildInvoiceHtml(order);
    const orderNumber = String(order?.orderNumber || order?.id || Date.now())
      .replace(/[\\/:*?"<>|]/g, '_')
      .trim();
    const fileName = `Invoice_${orderNumber}_${Date.now()}`;
    const options: any = {
      html,
      fileName,
      directory: Platform.OS === 'ios' ? 'Documents' : 'Invoice',
    };

    const file = await generatePDF(options);
    const path = file?.filePath;
    if (!path || !(await RNBlobUtil.fs.exists(path))) {
      throw new Error('Generated invoice file was not found.');
    }

    if (Platform.OS === 'android') {
      const savedPath =
        Platform.Version >= 29
          ? await RNBlobUtil.MediaCollection.copyToMediaStore(
              {
                name: `${fileName}.pdf`,
                parentFolder: '',
                mimeType: 'application/pdf',
              },
              'Download',
              path,
            )
          : await (async () => {
              const permission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              );
              if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                throw new Error('Storage permission is required to save invoices.');
              }
              const destination = `${RNBlobUtil.fs.dirs.DownloadDir}/${fileName}.pdf`;
              await RNBlobUtil.fs.cp(path, destination);
              if (!(await RNBlobUtil.fs.exists(destination))) {
                throw new Error('Invoice could not be saved to Downloads.');
              }
              return destination;
            })();

      if (!savedPath) {
        throw new Error('Invoice could not be saved to Downloads.');
      }

      try {
        await notifee.requestPermission();
        const channelId = await notifee.createChannel({
          id: 'invoice',
          name: 'Invoices',
          importance: AndroidImportance.HIGH,
        });
        await notifee.displayNotification({
          title: 'Invoice Downloaded',
          body: `Invoice ${order?.orderNumber || ''} downloaded`,
          android: {
            channelId,
            pressAction: {id: 'default'},
          },
          data: {invoicePath: path},
        });
      } catch (notificationError) {
        console.warn('Invoice notification could not be displayed:', notificationError);
      }
    }

    return {success: true, path};
  } catch (error: any) {
    console.log('Invoice error:', error?.message || error);
    return {success: false, error};
  }
};

export const openInvoice = async (path: string) => {
  if (!path) {
    throw new Error('Invoice file path is missing.');
  }
  const filePath = path.startsWith('file://') ? path.slice(7) : path;
  if (!(await RNBlobUtil.fs.exists(filePath))) {
    throw new Error('Invoice file is no longer available.');
  }
  await FileViewer.open(filePath, {
    showOpenWithDialog: true,
    displayName: filePath.split(/[\\/]/).pop() || 'Invoice.pdf',
  });
};
