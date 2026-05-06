import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const BRAND_GOLD = "#C5A572";
const BRAND_DARK = "#111111";

const getBaseUrl = () => {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

const commonStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
  body { font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .email-container { max-width: 600px; margin: 0 auto; color: ${BRAND_DARK}; border: 1px solid #f0f0f0; background-color: #ffffff; }
  .header { padding: 40px; text-align: center; background-color: ${BRAND_DARK}; }
  .logo { height: 35px; brightness: 200%; }
  .content { padding: 40px; }
  .footer { padding: 30px; text-align: center; border-top: 1px solid #f0f0f0; background-color: #fafaf9; }
  .btn { display: inline-block; padding: 16px 32px; background-color: ${BRAND_DARK}; color: #ffffff !important; text-decoration: none; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; border-radius: 2px; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; font-weight: 600; margin-bottom: 5px; }
  .value { font-size: 14px; margin-bottom: 20px; color: ${BRAND_DARK}; }
  .divider { height: 1px; background-color: #eee; margin: 30px 0; }
  .order-id { font-size: 12px; color: ${BRAND_GOLD}; letter-spacing: 1px; }
`;

export const sendReceiptEmail = async (order: any) => {
  if (!process.env.SMTP_USER) {
    console.warn("SMTP_USER not configured. Skipping email receipt dispatch.");
    return;
  }

  const itemsList = order.items.map((item: any) => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
        <div style="font-weight: 600;">${item.product?.name || 'Artisanal Surface'}</div>
        <div style="font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">${item.dimension || ''} • ${item.texture || ''} (x${item.quantity})</div>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 14px; font-weight: 400;">D${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Balaji Enterprise</h2>
            <p style="color: ${BRAND_GOLD}; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">Digital Atelier & Surfaces</p>
          </div>
          
          <div class="content">
            <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 25px; line-height: 1.4;">Order Confirmed, ${order.customerName.split(' ')[0]}.</h1>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 35px;">Your procurement request has been successfully recorded. Our Atelier team is currently reviewing your selection.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <thead>
                <tr>
                  <th style="padding-bottom: 15px; border-bottom: 2px solid ${BRAND_DARK}; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Item Selection</th>
                  <th style="padding-bottom: 15px; border-bottom: 2px solid ${BRAND_DARK}; text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
                <tr>
                  <td style="padding: 25px 0 0 0; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Total Procurement</td>
                  <td style="padding: 25px 0 0 0; font-weight: 600; text-align: right; font-size: 16px; color: ${BRAND_GOLD};">D${order.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="divider"></div>

            <div style="background-color: #fafaf9; padding: 25px; border-radius: 2px;">
              <div class="label">Reference ID</div>
              <div class="value order-id">#${order.id}</div>
              
              <div class="label">Shipment Destination</div>
              <div class="value" style="font-size: 13px; color: #555; line-height: 1.6;">${order.customerAddress},<br>${order.customerCity}, ${order.customerRegion}</div>
            </div>
          </div>
          
          <div class="footer">
            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">© 2026 Balaji Enterprise Atelier • Sourcing Excellence</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Procurement Confirmation: Order #${order.id.slice(-6).toUpperCase()}`,
      html,
    });
    console.log(`Receipt dispatched to ${order.customerEmail}`);
  } catch (error) {
    console.error("Error dispatching receipt email:", error);
  }
};

export const sendInquiryResponseEmail = async (inquiry: any, responseMessage: string) => {
  if (!process.env.SMTP_USER) return;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Balaji Enterprise</h2>
          </div>
          <div class="content">
            <div class="label" style="text-align: center; margin-bottom: 30px;">Atelier Response</div>
            <h1 style="font-size: 18px; font-weight: 400; line-height: 1.6; margin-bottom: 30px;">Dear ${inquiry.customerName},</h1>
            
            <div style="background-color: white; border-left: 2px solid ${BRAND_GOLD}; padding: 0 0 0 30px; margin: 40px 0; line-height: 1.8; color: #444; font-size: 15px;">
              ${responseMessage}
            </div>

            <p style="color: #888; font-size: 13px; line-height: 1.6; margin-top: 40px;">Our team remains at your disposal for further technical specifications or logistics coordination.</p>
          </div>
          <div class="footer">
             <p style="font-size: 10px; color: #aaa;">Reference Inquiry: #${inquiry.id.slice(0, 8)}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: inquiry.customerEmail,
      subject: `Response to your Inquiry for ${inquiry.product?.name || 'Balaji Enterprise'}`,
      html,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
};

export const sendAdminOrderAlert = async (order: any) => {
  if (!process.env.SMTP_USER) return;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header" style="background-color: ${BRAND_GOLD};">
            <h2 style="color: #111; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">New Procurement</h2>
          </div>
          <div class="content">
            <div style="margin-bottom: 25px;">
              <div class="label">Client</div>
              <div class="value" style="font-weight: 600;">${order.customerName}</div>
              
              <div class="label">Amount</div>
              <div class="value" style="font-size: 20px; color: ${BRAND_GOLD}; font-weight: 600;">D${order.total.toLocaleString()}</div>
            </div>
            <a href="${getBaseUrl()}/admin/orders/${order.id}" class="btn">Process Order</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise System" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `[SYSTEM] New Order Received - D${order.total.toLocaleString()}`,
      html,
    });
  } catch (error) {
    console.error("Admin order alert failed:", error);
  }
};

export const sendAdminInquiryAlert = async (inquiry: any) => {
  if (!process.env.SMTP_USER) return;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">New Inquiry</h2>
          </div>
          <div class="content">
             <p style="font-size: 14px; margin-bottom: 25px;"><strong>${inquiry.customerName}</strong> has requested information regarding <strong>${inquiry.product?.name || 'a collection'}</strong>.</p>
             <div style="background-color: #f9f9f9; padding: 20px; font-style: italic; color: #555; font-size: 13px; margin-bottom: 30px;">
               "${inquiry.message || 'No specific inquiry message provided.'}"
             </div>
             <a href="${getBaseUrl()}/admin/inquiries/${inquiry.id}" class="btn">View in Dashboard</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise System" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `[SYSTEM] New Inquiry Selection from ${inquiry.customerName}`,
      html,
    });
  } catch (error) {
    console.error("Admin inquiry alert failed:", error);
  }
};

export const sendPaymentSuccessEmail = async (order: any) => {
  if (!process.env.SMTP_USER) return;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header" style="background-color: #003D4D;">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">Payment Received</h2>
          </div>
          <div class="content" style="text-align: center;">
            <div style="color: #003D4D; font-size: 48px; margin-bottom: 20px;">✓</div>
            <h1 style="font-size: 20px; font-weight: 400;">Your surfaces have been secured.</h1>
            <p style="color: #666; line-height: 1.8; margin-bottom: 40px;">The payment for Order #${order.id.slice(-6).toUpperCase()} is confirmed. Our logistics team will notify you once dispatch begins.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Payment Confirmed: Your Order is now being prepared`,
      html,
    });
  } catch (error) {
    console.error("Payment success email failed:", error);
  }
};

export const sendOrderStatusUpdateEmail = async (order: any, status: string) => {
  if (!process.env.SMTP_USER) return;

  const statusMap: any = {
    'SHIPPED': 'En Route',
    'DELIVERED': 'Delivered',
    'REFUNDED': 'Refunded'
  };

  const friendlyStatus = statusMap[status] || status;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">Logistics Update</h2>
          </div>
          <div class="content">
            <div class="label">Current Status</div>
            <h1 style="font-size: 24px; color: ${BRAND_GOLD}; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">${friendlyStatus}</h1>
            <div class="divider"></div>
            <p style="color: #666; line-height: 1.6;">Your order <strong>#${order.id}</strong> has been updated. ${status === 'SHIPPED' ? 'Your surfaces are currently in transit.' : 'The procurement process is complete.'}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Order Update: ${friendlyStatus} (#${order.id.slice(-6).toUpperCase()})`,
      html,
    });
  } catch (error) {
    console.error("Status update email failed:", error);
  }
};

export const sendOrderApprovalEmail = async (order: any) => {
  if (!process.env.SMTP_USER) return;

  const checkoutUrl = `${getBaseUrl()}/checkout/payment?orderId=${order.id}`;

  const html = `
    <html>
      <head><style>${commonStyles}</style></head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="color: #fff; font-weight: 300; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Balaji Enterprise</h2>
          </div>
          <div class="content">
            <h1 style="font-size: 20px; font-weight: 400; margin-bottom: 25px;">Your Order Request Approved.</h1>
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 35px;">We are pleased to inform you that your procurement request for <strong>Order #${order.id.slice(-6).toUpperCase()}</strong> has been approved by our specialists.</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 35px;">You can now proceed to our secure Gateway to finalize your purchase and secure your surfaces.</p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${checkoutUrl}" class="btn">Secure & Pay Now</a>
            </div>

            <p style="font-size: 12px; color: #888; text-align: center;">Reference Order: #${order.id}</p>
          </div>
          <div class="footer">
            <p style="font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">© 2026 Balaji Enterprise Atelier</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Approved: Proceed to Payment for Order #${order.id.slice(-6).toUpperCase()}`,
      html,
    });
  } catch (error) {
    console.error("Order approval email failed:", error);
  }
};

export const sendRefundRequestAdminEmail = async (order: any, reason: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to business owner
      subject: `Refund Request: Order #${order.id.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; color: #ffffff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="text-transform: uppercase; letter-spacing: 0.4em; font-size: 10px; color: #C5A572; margin-bottom: 10px;">The Atelier Management</p>
            <h1 style="font-size: 28px; font-weight: 300; margin: 0; color: #ffffff;">Refund Request Received</h1>
          </div>
          
          <div style="border: 1px solid #333333; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px;">Review Required</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              A client has requested a refund for order <strong>#${order.id.toUpperCase()}</strong>.
            </p>
            
            <div style="background-color: #1a1a1a; padding: 20px; border-left: 2px solid #C5A572; margin-bottom: 30px;">
              <p style="font-size: 10px; color: #C5A572; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Client Reason</p>
              <p style="font-size: 14px; font-style: italic; color: #dddddd; margin: 0;">"${reason}"</p>
            </div>

            <div style="margin-bottom: 30px;">
              <p style="font-size: 10px; color: #888888; text-transform: uppercase; margin-bottom: 5px;">Acquirer</p>
              <p style="font-size: 16px; margin: 0;">${order.customerName}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <p style="font-size: 10px; color: #888888; text-transform: uppercase; margin-bottom: 5px;">Total Settlement</p>
              <p style="font-size: 20px; color: #C5A572; margin: 0;">D${order.total.toLocaleString()}</p>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${getBaseUrl()}/admin/orders" style="display: inline-block; padding: 15px 40px; background-color: #C5A572; color: #111111; text-decoration: none; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; font-weight: bold;">Review in Dashboard</a>
          </div>

          <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #333333; text-align: center;">
            <p style="font-size: 9px; color: #555555; text-transform: uppercase; letter-spacing: 0.2em;">Balaji Enterprise Digital Atelier &copy; 2026</p>
          </div>
        </div>
      `,
    });
    console.log("Refund request admin alert sent:", info.messageId);
  } catch (error) {
    console.error("Refund request email failed:", error);
  }
};

export const sendOrderCancelledEmail = async (order: any, reason?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Balaji Enterprise Atelier" <${process.env.SMTP_USER}>`,
      to: order.user?.email || order.customerEmail,
      subject: `Order Cancelled: #${order.id.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #111111; color: #ffffff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="text-transform: uppercase; letter-spacing: 0.4em; font-size: 10px; color: #C5A572; margin-bottom: 10px;">The Atelier Management</p>
            <h1 style="font-size: 28px; font-weight: 300; margin: 0; color: #ffffff;">Order Cancelled</h1>
          </div>
          
          <div style="border: 1px solid #333333; padding: 30px; margin-bottom: 30px;">
            <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Your requisition for order <strong>#${order.id.toUpperCase()}</strong> has been successfully cancelled.
            </p>
            
            ${reason ? `
            <div style="background-color: #1a1a1a; padding: 20px; border-left: 2px solid #C5A572; margin-bottom: 30px;">
              <p style="font-size: 10px; color: #C5A572; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Primary Reason</p>
              <p style="font-size: 14px; font-style: italic; color: #dddddd; margin: 0;">"${reason}"</p>
            </div>
            ` : ''}

            <p style="font-size: 12px; color: #888888; line-height: 1.6;">
              If this was a mistake, or if you wish to curate a different collection, please revisit our digital storefront. No charges have been processed for this cancellation.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${getBaseUrl()}/collections" style="display: inline-block; padding: 15px 40px; background-color: #C5A572; color: #111111; text-decoration: none; text-transform: uppercase; letter-spacing: 0.2em; font-size: 11px; font-weight: bold;">Explore Collections</a>
          </div>

          <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #333333; text-align: center;">
            <p style="font-size: 9px; color: #555555; text-transform: uppercase; letter-spacing: 0.2em;">Balaji Enterprise Digital Atelier &copy; 2026</p>
          </div>
        </div>
      `,
    });
    console.log("Order cancellation email sent:", info.messageId);
  } catch (error) {
    console.error("Order cancellation email failed:", error);
  }
};
