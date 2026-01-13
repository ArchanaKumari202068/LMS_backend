const QRcode = require("qrcode");

async function generateQrString(data) {
  try {
    const qrBase64 = await QRcode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 2,
      width: 300,
    });
    return qrBase64;
  } catch (error) {
    throw new Error("Qr Code generation failed...");
  }
}

module.exports = {
  generateQrString,
};
