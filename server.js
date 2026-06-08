import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/send-receipt', async (req, res) => {
  const { email, receipt, settings } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Customer email is required' });
  }
  
  if (!settings.gmailAppPassword || !settings.storeEmail) {
    return res.status(400).json({ error: 'Gmail App Password and Store Email must be configured in settings' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.storeEmail,
        pass: settings.gmailAppPassword
      }
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <h2 style="text-align: center;">${settings.storeName}</h2>
        <p style="text-align: center;">Receipt #${receipt.receiptNumber}</p>
        <hr />
        <table style="width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: right;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${receipt.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">${settings.currencySymbol} ${item.finalPrice}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <hr />
        <div style="text-align: right;">
          <p>Subtotal: ${settings.currencySymbol} ${receipt.subtotal}</p>
          <p>Tax: ${settings.currencySymbol} ${receipt.taxTotal}</p>
          <p>Discount: ${settings.currencySymbol} ${receipt.discountTotal}</p>
          <h3>Total: ${settings.currencySymbol} ${receipt.grandTotal}</h3>
        </div>
        <hr />
        <p style="text-align: center; color: #555;">${settings.receiptThankYouNote}</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${settings.storeName}" <${settings.storeEmail}>`,
      to: email,
      subject: `Your Receipt from ${settings.storeName}`,
      html: htmlContent
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email: ' + error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Local API Server running on port ${PORT}`);
});
