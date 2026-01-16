const nodemailer = require('nodemailer');

// Create transporter
// Create transporter
const createTransporter = () => {
    // Check for password in either variable
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    // Check if we are using Gmail (explicit host, service, or gmail address)
    const isGmail =
        process.env.EMAIL_HOST === 'smtp.gmail.com' ||
        process.env.EMAIL_SERVICE === 'gmail' ||
        (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com'));

    if (process.env.EMAIL_USER && emailPassword) {
        // Configuration for Gmail
        if (isGmail) {
            console.log('📧 Configuring email service for Gmail...');
            return nodemailer.createTransport({
                service: 'gmail', // Built-in support for Gmail
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: emailPassword
                }
            });
        }

        // Generic SMTP Configuration
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: emailPassword
            },
            tls: {
                rejectUnauthorized: false // Help with self-signed certificates if needed
            }
        });
    } else {
        // Fallback for development if credentials missing
        console.warn('⚠️  Email credentials missing. Using Ethereal Email (fake).');
        console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in .env');

        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'test@ethereal.email',
                pass: 'test'
            }
        });
    }
};

// Send email verification
exports.sendVerificationEmail = async (email, name, token) => {
    try {
        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

        const mailOptions = {
            from: `"HS Global Export" <${process.env.EMAIL_FROM || 'noreply@hsglobal.com'}>`,
            to: email,
            subject: 'Verify Your Email - HS Global Export',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome, ${name}!</h2>
                            <p>Thank you for registering with HS Global Export. Please verify your email address to complete your registration.</p>
                            <p>Click the button below to verify your email:</p>
                            <a href="${verificationUrl}" class="button">Verify Email</a>
                            <p>Or copy and paste this link in your browser:</p>
                            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                            <p><strong>This link will expire in 24 hours.</strong></p>
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);

        // For development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, token) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        const mailOptions = {
            from: `"HS Global Export" <${process.env.EMAIL_FROM || 'noreply@hsglobal.com'}>`,
            to: email,
            subject: 'Password Reset Request - HS Global Export',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                        </div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hi ${name},</p>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                            <p>Or copy and paste this link in your browser:</p>
                            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul>
                                    <li>This link will expire in 1 hour</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                    <li>Your password will remain unchanged</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);

        // For development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send OTP email
exports.sendOTPEmail = async (email, name, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"HS Global Export" <${process.env.EMAIL_FROM || 'noreply@hsglobal.com'}>`,
            to: email,
            subject: 'Your Login OTP - HS Global Export',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; text-align: center; }
                        .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000; background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                        </div>
                        <div class="content">
                            <h2>Your Login OTP</h2>
                            <p>Hi ${name || 'there'},</p>
                            <p>Use this OTP to login to your account:</p>
                            <div class="otp">${otp}</div>
                            <p><strong>This OTP will expire in 10 minutes.</strong></p>
                            <p>If you didn't request this OTP, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent:', info.messageId);

        // For development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send order confirmation email
exports.sendOrderConfirmationEmail = async (email, name, orderDetails) => {
    try {
        const transporter = createTransporter();

        // Format amount (convert from paise to rupees)
        const formatAmount = (amount) => {
            return (amount / 100).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR'
            });
        };

        // Generate items HTML
        const itemsHtml = orderDetails.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center;">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 10px;">` : ''}
                        <div>
                            <strong>${item.name}</strong><br>
                            <small style="color: #666;">Quantity: ${item.quantity}</small>
                        </div>
                    </div>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ${formatAmount(item.price * item.quantity)}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"HS Global Export" <${process.env.EMAIL_FROM || 'noreply@hsglobal.com'}>`,
            to: email,
            subject: `Order Confirmation - ${orderDetails.orderId} - HS Global Export`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .order-info { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                        .info-label { font-weight: bold; color: #666; }
                        .items-table { width: 100%; margin: 20px 0; background: #fff; border-radius: 5px; overflow: hidden; }
                        .total-row { background: #f0f0f0; font-weight: bold; font-size: 18px; }
                        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .success-badge { background: #d4edda; color: #155724; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                        </div>
                        <div class="content">
                            <div class="success-badge">
                                ✅ Order Confirmed
                            </div>
                            <h2>Thank you for your order, ${name}!</h2>
                            <p>We've received your order and it's being processed. You'll receive a shipping confirmation email once your items are on their way.</p>
                            
                            <div class="order-info">
                                <h3 style="margin-top: 0;">Order Details</h3>
                                <div class="info-row">
                                    <span class="info-label">Order ID:</span>
                                    <span>${orderDetails.orderId}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Order Date:</span>
                                    <span>${new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Payment ID:</span>
                                    <span>${orderDetails.paymentId || 'Processing...'}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Status:</span>
                                    <span style="color: #28a745; font-weight: bold;">PAID</span>
                                </div>
                            </div>

                            <h3>Order Items</h3>
                            <table class="items-table" cellpadding="0" cellspacing="0">
                                <thead>
                                    <tr style="background: #f8f9fa;">
                                        <th style="padding: 10px; text-align: left;">Item</th>
                                        <th style="padding: 10px; text-align: right;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                    <tr class="total-row">
                                        <td style="padding: 15px;">Total Amount</td>
                                        <td style="padding: 15px; text-align: right;">${formatAmount(orderDetails.amount)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h3>Shipping Address</h3>
                            <div class="order-info">
                                <p style="margin: 0;">
                                    ${orderDetails.customer?.name || name}<br>
                                    ${orderDetails.shippingAddress?.street || ''}<br>
                                    ${orderDetails.shippingAddress?.city || ''}, ${orderDetails.shippingAddress?.state || ''} ${orderDetails.shippingAddress?.postalCode || ''}<br>
                                    ${orderDetails.shippingAddress?.country || ''}<br>
                                    <br>
                                    Phone: ${orderDetails.customer?.phone || ''}<br>
                                    Email: ${orderDetails.customer?.email || email}
                                </p>
                            </div>

                            <p style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?tab=orders" class="button">View Order Status</a>
                            </p>

                            <p style="font-size: 14px; color: #666;">
                                <strong>What's Next?</strong><br>
                                • We'll process your order within 24 hours<br>
                                • You'll receive a shipping confirmation with tracking details<br>
                                • Track your order anytime from your account
                            </p>

                            <p style="font-size: 14px; color: #666;">
                                If you have any questions, please contact our support team.
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent:', info.messageId);

        // For development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Order confirmation email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send payment failed notification
exports.sendPaymentFailedEmail = async (email, name, orderDetails) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"HS Global Export" <${process.env.EMAIL_FROM || 'noreply@hsglobal.com'}>`,
            to: email,
            subject: 'Payment Failed - HS Global Export',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .error-badge { background: #f8d7da; color: #721c24; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                        </div>
                        <div class="content">
                            <div class="error-badge">
                                ⚠️ Payment Failed
                            </div>
                            <h2>Hi ${name},</h2>
                            <p>We were unable to process your payment for order <strong>${orderDetails.orderId}</strong>.</p>
                            
                            <p><strong>What happened?</strong><br>
                            Your payment could not be completed. This might be due to:</p>
                            <ul>
                                <li>Insufficient funds</li>
                                <li>Card declined by bank</li>
                                <li>Network connectivity issues</li>
                                <li>Payment timeout</li>
                            </ul>

                            <p><strong>What can you do?</strong><br>
                            Don't worry! Your items are still in your cart. You can try again:</p>

                            <p style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout" class="button">Retry Payment</a>
                            </p>

                            <p style="font-size: 14px; color: #666;">
                                If you continue to experience issues, please contact your bank or try a different payment method.
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Payment failed email sent:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Payment failed email error:', error);
        return { success: false, error: error.message };
    }
};

// Send contact form notification to admin
exports.sendContactNotificationEmail = async (contactData) => {
    try {
        const transporter = createTransporter();
        const adminEmail = process.env.EMAIL_TO || 'inquiry@hsglobalexport.com';
        const fromEmail = process.env.EMAIL_FROM || 'inquiry@hsglobalexport.com';

        const mailOptions = {
            from: `"HS Global Export - Contact Form" <${fromEmail}>`,
            to: adminEmail,
            replyTo: contactData.email,
            subject: `New Contact Form Submission: ${contactData.subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .info-box { background: #fff; padding: 15px; border-left: 4px solid #000; margin: 15px 0; }
                        .label { font-weight: bold; color: #666; display: inline-block; width: 120px; }
                        .message-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .badge { background: #28a745; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>HS Global Export</h1>
                            <p style="margin: 0; font-size: 14px;">Contact Form Submission</p>
                        </div>
                        <div class="content">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <span class="badge">NEW INQUIRY</span>
                            </div>
                            
                            <h2 style="margin-top: 0;">Contact Details</h2>
                            
                            <div class="info-box">
                                <p><span class="label">Name:</span> ${contactData.name}</p>
                                <p><span class="label">Email:</span> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                                <p><span class="label">Subject:</span> ${contactData.subject}</p>
                                <p><span class="label">Submitted:</span> ${new Date(contactData.submittedAt).toLocaleString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
                                <p><span class="label">Contact ID:</span> ${contactData.contactId}</p>
                            </div>

                            <h3>Message</h3>
                            <div class="message-box">
                                ${contactData.message.replace(/\n/g, '<br>')}
                            </div>

                            ${contactData.referenceImage ? `
                            <h3>Reference Image</h3>
                            <div class="message-box" style="text-align: center;">
                                <img src="${contactData.referenceImage}" alt="Reference Image" style="max-width: 100%; height: auto; border-radius: 5px;" />
                                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                                    <a href="${contactData.referenceImage}" target="_blank">View Full Size</a>
                                </p>
                            </div>
                            ` : ''}

                            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                                <strong>Quick Actions:</strong><br>
                                • Reply directly to this email to respond to ${contactData.name}<br>
                                • View in admin panel: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/contacts/${contactData.contactId}">View Details</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                            <p>This is an automated notification from your contact form.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Contact notification email sent to admin:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Contact notification email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send confirmation email to customer
exports.sendCustomerConfirmationEmail = async (contactData) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_FROM || 'inquiry@hsglobalexport.com';

        const mailOptions = {
            from: `"HS Global Export" <${fromEmail}>`,
            to: contactData.email,
            subject: `Thank you for contacting HS Global Export`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .message-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #000; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .contact-info { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">HS Global Export</h1>
                            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Premium Natural Stones & Granite</p>
                        </div>
                        <div class="content">
                            <h2 style="margin-top: 0; color: #000;">Thank You for Reaching Out!</h2>
                            
                            <p>Dear ${contactData.name},</p>
                            
                            <p>We have successfully received your inquiry and appreciate you taking the time to contact us.</p>
                            
                            <div class="message-box">
                                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Your Inquiry:</strong></p>
                                <p style="margin: 10px 0 0 0;"><strong>Subject:</strong> ${contactData.subject}</p>
                                <p style="margin: 5px 0 0 0; color: #666;">${contactData.message.substring(0, 150)}${contactData.message.length > 150 ? '...' : ''}</p>
                            </div>
                            
                            <p><strong>What happens next?</strong></p>
                            <ul style="color: #666;">
                                <li>Our team will review your inquiry carefully</li>
                                <li>We will get back to you within 24-48 hours</li>
                                <li>You will receive a detailed response via email</li>
                            </ul>
                            
                            <div class="contact-info">
                                <p style="margin: 0; font-size: 14px;"><strong>In the meantime, you can reach us at:</strong></p>
                                <p style="margin: 10px 0 0 0; font-size: 14px;">
                                    📧 Email: inquiry@hsglobalexport.com<br>
                                    📞 Phone: +91 81071 15116<br>
                                    🏢 Address: C-108, Titanium Business Park, Makarba, Ahmedabad - 380051
                                </p>
                            </div>
                            
                            <p style="margin-top: 30px;">Thank you for considering HS Global Export for your natural stone needs.</p>
                            
                            <p style="margin-top: 20px;">
                                Best regards,<br>
                                <strong>HS Global Export Team</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                            <p>This is an automated confirmation email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to customer:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Customer confirmation email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send quotation request notification to admin
exports.sendQuotationNotificationEmail = async (quotationData) => {
    try {
        const transporter = createTransporter();
        const adminEmail = process.env.EMAIL_TO || 'inquiry@hsglobalexport.com';
        const fromEmail = process.env.EMAIL_FROM || 'inquiry@hsglobalexport.com';

        const mailOptions = {
            from: `"HS Global Export - Quotation Request" \u003c${fromEmail}\u003e`,
            to: adminEmail,
            replyTo: quotationData.email,
            subject: `New Slab Quotation Request: ${quotationData.productName}`,
            html: `
                \u003c!DOCTYPE html\u003e
                \u003chtml\u003e
                \u003chead\u003e
                    \u003cstyle\u003e
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .info-box { background: #fff; padding: 15px; border-left: 4px solid #000; margin: 15px 0; }
                        .label { font-weight: bold; color: #666; display: inline-block; width: 150px; }
                        .specs-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #f59e0b; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .badge { background: #f59e0b; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
                    \u003c/style\u003e
                \u003c/head\u003e
                \u003cbody\u003e
                    \u003cdiv class="container"\u003e
                        \u003cdiv class="header"\u003e
                            \u003ch1\u003eHS Global Export\u003c/h1\u003e
                            \u003cp style="margin: 0; font-size: 14px;"\u003eSlab Quotation Request\u003c/p\u003e
                        \u003c/div\u003e
                        \u003cdiv class="content"\u003e
                            \u003cdiv style="text-align: center; margin-bottom: 20px;"\u003e
                                \u003cspan class="badge"\u003eNEW QUOTATION REQUEST\u003c/span\u003e
                            \u003c/div\u003e
                            
                            \u003ch2 style="margin-top: 0;"\u003eCustomer Details\u003c/h2\u003e
                            
                            \u003cdiv class="info-box"\u003e
                                \u003cp\u003e\u003cspan class="label"\u003eName:\u003c/span\u003e ${quotationData.name}\u003c/p\u003e
                                \u003cp\u003e\u003cspan class="label"\u003eEmail:\u003c/span\u003e \u003ca href="mailto:${quotationData.email}"\u003e${quotationData.email}\u003c/a\u003e\u003c/p\u003e
                                \u003cp\u003e\u003cspan class="label"\u003eMobile:\u003c/span\u003e \u003ca href="tel:${quotationData.mobile}"\u003e${quotationData.mobile}\u003c/a\u003e\u003c/p\u003e
                                \u003cp\u003e\u003cspan class="label"\u003eSubmitted:\u003c/span\u003e ${new Date(quotationData.submittedAt).toLocaleString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}\u003c/p\u003e
                                \u003cp\u003e\u003cspan class="label"\u003eQuotation ID:\u003c/span\u003e ${quotationData.quotationId}\u003c/p\u003e
                            \u003c/div\u003e

                            \u003ch3\u003eProduct Specifications\u003c/h3\u003e
                            \u003cdiv class="specs-box"\u003e
                                \u003cp\u003e\u003cstrong\u003eProduct:\u003c/strong\u003e ${quotationData.productName}\u003c/p\u003e
                                \u003cp\u003e\u003cstrong\u003eFinish Type:\u003c/strong\u003e ${quotationData.finish}\u003c/p\u003e
                                \u003cp\u003e\u003cstrong\u003eThickness:\u003c/strong\u003e ${quotationData.thickness}\u003c/p\u003e
                                \u003cp\u003e\u003cstrong\u003eRequirement:\u003c/strong\u003e ${quotationData.requirement} sq ft\u003c/p\u003e
                            \u003c/div\u003e

                            \u003cp style="font-size: 14px; color: #666; margin-top: 30px;"\u003e
                                \u003cstrong\u003eQuick Actions:\u003c/strong\u003e\u003cbr\u003e
                                • Reply directly to this email to respond to ${quotationData.name}\u003cbr\u003e
                                • Call customer at ${quotationData.mobile}\u003cbr\u003e
                                • View in admin panel: \u003ca href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin?tab=quotations"\u003eView Details\u003c/a\u003e
                            \u003c/p\u003e
                        \u003c/div\u003e
                        \u003cdiv class="footer"\u003e
                            \u003cp\u003e\u0026copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.\u003c/p\u003e
                            \u003cp\u003eThis is an automated notification from your quotation system.\u003c/p\u003e
                        \u003c/div\u003e
                    \u003c/div\u003e
                \u003c/body\u003e
                \u003c/html\u003e
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Quotation notification email sent to admin:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Quotation notification email failed:', error);
        return { success: false, error: error.message };
    }
};

// Send quotation confirmation email to customer
exports.sendQuotationConfirmationEmail = async (quotationData) => {
    try {
        const transporter = createTransporter();
        const fromEmail = process.env.EMAIL_FROM || 'inquiry@hsglobalexport.com';

        const mailOptions = {
            from: `"HS Global Export" \u003c${fromEmail}\u003e`,
            to: quotationData.email,
            subject: `Quotation Request Received - ${quotationData.productName}`,
            html: `
                \u003c!DOCTYPE html\u003e
                \u003chtml\u003e
                \u003chead\u003e
                    \u003cstyle\u003e
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #fff; padding: 30px 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                        .specs-box { background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                        .contact-info { background: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    \u003c/style\u003e
                \u003c/head\u003e
                \u003cbody\u003e
                    \u003cdiv class="container"\u003e
                        \u003cdiv class="header"\u003e
                            \u003ch1 style="margin: 0;"\u003eHS Global Export\u003c/h1\u003e
                            \u003cp style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;"\u003ePremium Natural Stones \u0026 Granite\u003c/p\u003e
                        \u003c/div\u003e
                        \u003cdiv class="content"\u003e
                            \u003ch2 style="margin-top: 0; color: #000;"\u003eThank You for Your Quotation Request!\u003c/h2\u003e
                            
                            \u003cp\u003eDear ${quotationData.name},\u003c/p\u003e
                            
                            \u003cp\u003eWe have successfully received your quotation request for \u003cstrong\u003e${quotationData.productName}\u003c/strong\u003e and appreciate your interest in our premium stone products.\u003c/p\u003e
                            
                            \u003cdiv class="specs-box"\u003e
                                \u003cp style="margin: 0; color: #666; font-size: 14px;"\u003e\u003cstrong\u003eYour Request Details:\u003c/strong\u003e\u003c/p\u003e
                                \u003cp style="margin: 10px 0 0 0;"\u003e\u003cstrong\u003eProduct:\u003c/strong\u003e ${quotationData.productName}\u003c/p\u003e
                                \u003cp style="margin: 5px 0 0 0;"\u003e\u003cstrong\u003eFinish:\u003c/strong\u003e ${quotationData.finish}\u003c/p\u003e
                                \u003cp style="margin: 5px 0 0 0;"\u003e\u003cstrong\u003eThickness:\u003c/strong\u003e ${quotationData.thickness}\u003c/p\u003e
                                \u003cp style="margin: 5px 0 0 0;"\u003e\u003cstrong\u003eQuantity:\u003c/strong\u003e ${quotationData.requirement} sq ft\u003c/p\u003e
                            \u003c/div\u003e
                            
                            \u003cp\u003e\u003cstrong\u003eWhat happens next?\u003c/strong\u003e\u003c/p\u003e
                            \u003cul style="color: #666;"\u003e
                                \u003cli\u003eOur team will review your requirements carefully\u003c/li\u003e
                                \u003cli\u003eWe will prepare a detailed quotation for you\u003c/li\u003e
                                \u003cli\u003eYou will receive our quote within 24-48 hours\u003c/li\u003e
                                \u003cli\u003eWe may contact you at ${quotationData.mobile} for any clarifications\u003c/li\u003e
                            \u003c/ul\u003e
                            
                            \u003cdiv class="contact-info"\u003e
                                \u003cp style="margin: 0; font-size: 14px;"\u003e\u003cstrong\u003eNeed immediate assistance?\u003c/strong\u003e\u003c/p\u003e
                                \u003cp style="margin: 10px 0 0 0; font-size: 14px;"\u003e
                                    📧 Email: inquiry@hsglobalexport.com\u003cbr\u003e
                                    📞 Phone: +91 81071 15116\u003cbr\u003e
                                    🏢 Address: C-108, Titanium Business Park, Makarba, Ahmedabad - 380051
                                \u003c/p\u003e
                            \u003c/div\u003e
                            
                            \u003cp style="margin-top: 30px;"\u003eThank you for considering HS Global Export for your natural stone needs.\u003c/p\u003e
                            
                            \u003cp style="margin-top: 20px;"\u003e
                                Best regards,\u003cbr\u003e
                                \u003cstrong\u003eHS Global Export Team\u003c/strong\u003e
                            \u003c/p\u003e
                        \u003c/div\u003e
                        \u003cdiv class="footer"\u003e
                            \u003cp\u003e\u0026copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.\u003c/p\u003e
                            \u003cp\u003eThis is an automated confirmation email.\u003c/p\u003e
                        \u003c/div\u003e
                    \u003c/div\u003e
                \u003c/body\u003e
                \u003c/html\u003e
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Quotation confirmation email sent to customer:', info.messageId);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Quotation confirmation email failed:', error);
        return { success: false, error: error.message };
    }
};
