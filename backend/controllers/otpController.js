const Otp = require('../models/Otp');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configure Email Transporter using same logic as emailService.js
const createTransporter = () => {
    const emailPassword = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;

    // Check if we are using Gmail
    const isGmail = emailHost === 'smtp.gmail.com' || 
                    process.env.EMAIL_SERVICE === 'gmail' ||
                    (emailUser && emailUser.includes('@gmail.com'));

    if (emailUser && emailPassword) {
        if (isGmail) {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPassword
                }
            });
        } else {
            // GoDaddy or other SMTP configuration
            return nodemailer.createTransport({
                host: emailHost,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: (process.env.SMTP_SECURE || 'false') === 'true',
                auth: {
                    user: emailUser,
                    pass: emailPassword
                },
                tls: {
                    rejectUnauthorized: false,
                    ciphers: 'SSLv3'
                }
            });
        }
    } else {
        console.warn('⚠️  Email credentials missing for OTP controller');
        return null;
    }
};

const transporter = createTransporter();

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email) return res.status(400).json({ ok: false, error: 'Missing email' });

        // Generate 6-digit OTP
        const code = ('' + Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Remove existing OTP for this email
        await Otp.deleteMany({ email });

        // Save to DB
        await Otp.create({
            email,
            code,
            expiresAt,
            attempts: 0
        });

        // Email Logic
        const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
        const emailPassword = process.env.SMTP_PASS || process.env.EMAIL_PASS;
        const emailFrom = process.env.EMAIL_FROM || emailUser;

        const mailOptions = {
            from: `"HS Global Export" <${emailFrom}>`,
            to: email,
            subject: 'Your HS Global Verification Code',
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
                            <h2>Your Verification Code</h2>
                            <p>Use this code to verify your email address:</p>
                            <div class="otp">${code}</div>
                            <p><strong>This code will expire in 5 minutes.</strong></p>
                            <p>If you didn't request this code, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} HS Global Export. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Your HS Global Export verification code is ${code}. It expires in 5 minutes. If you didn't request this code, please ignore this email.`
        };

        if (!emailUser || !emailPassword) {
            console.warn('❌ Email credentials missing in .env. Logging OTP.');
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[OTP] ${email} => ${code}`);
                return res.json({
                    ok: true,
                    note: 'log-only (configure SMTP_USER/SMTP_PASS)',
                    ttlMs: 300000,
                    otpToken: code
                });
            }
            return res.status(500).json({ ok: false, error: 'Server configuration error' });
        }

        if (!transporter) {
            console.error('❌ Email transporter not configured');
            return res.status(500).json({ ok: false, error: 'Email service unavailable' });
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log(`✅ OTP sent to ${email}`);
            return res.json({ ok: true, message: 'OTP sent to email', ttlMs: 300000 });
        } catch (err) {
            console.error('❌ Email send error:', err);

            // Dev Fallback
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[OTP Fallback] ${email} => ${code}`);
                return res.json({
                    ok: true,
                    note: 'email_fail_fallback',
                    otpToken: code
                });
            }
            throw err;
        }

    } catch (error) {
        console.error('OTP Send Failed:', error);
        res.status(500).json({ ok: false, error: 'Failed to send OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body || {};
        if (!email || !code) return res.status(400).json({ ok: false, error: 'Missing email or code' });

        // Find OTP record
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ ok: false, error: 'Code not found or expired' });
        }

        // Check attempts
        if (otpRecord.attempts > 5) {
            await Otp.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ ok: false, error: 'Too many attempts' });
        }

        // Check Match
        if (String(code) !== String(otpRecord.code)) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ ok: false, error: 'Invalid code' });
        }

        // Success
        await Otp.deleteOne({ _id: otpRecord._id });

        return res.json({ ok: true, message: 'Verified' });

    } catch (error) {
        console.error('OTP Verify Failed:', error);
        res.status(500).json({ ok: false, error: 'Verification failed' });
    }
};
