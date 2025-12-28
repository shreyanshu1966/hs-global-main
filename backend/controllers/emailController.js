const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
    try {
        const { to, subject, data } = req.body || {};
        if (!to) return res.status(400).json({ ok: false, error: 'Missing recipient' });

        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

        // Check configuration
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            console.warn('SMTP env not configured. Logging email.');
            console.log('Email request:', { to, subject, data });
            return res.json({ ok: true, note: 'log-only (configure SMTP env)' });
        }

        const transporter = nodemailer.createTransporter({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10),
            secure: SMTP_SECURE === 'true',
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const info = await transporter.sendMail({
            from: SMTP_USER,
            to,
            subject: subject || 'New Message',
            text: JSON.stringify(data, null, 2),
            html: `<pre>${JSON.stringify(data, null, 2)}</pre>`,
        });

        return res.json({ ok: true, messageId: info.messageId });

    } catch (error) {
        console.error('Email send failed', error);
        res.status(500).json({ ok: false, error: 'Email send failed' });
    }
};
