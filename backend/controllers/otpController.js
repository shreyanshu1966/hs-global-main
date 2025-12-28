const Otp = require('../models/Otp');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port if provided
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password
    }
});

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
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your HS Global Verification Code',
            text: `Your verification code is ${code}. It expires in 5 minutes.`
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('❌ Email credentials missing in .env. Logging OTP.');
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[OTP] ${email} => ${code}`);
                return res.json({
                    ok: true,
                    note: 'log-only (configure EMAIL_USER/PASS)',
                    ttlMs: 300000,
                    otpToken: code
                });
            }
            return res.status(500).json({ ok: false, error: 'Server configuration error' });
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
