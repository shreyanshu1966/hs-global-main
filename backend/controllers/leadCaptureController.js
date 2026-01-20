const LeadCapture = require('../models/LeadCapture');
const { sendLeadNotificationEmail, sendLeadConfirmationEmail } = require('../services/emailService');

// Submit lead capture request
exports.submitLeadCapture = async (req, res) => {
    try {
        const { name, email, countryCode, phone, clientType, services, message } = req.body;

        // Validation
        if (!name || !email || !countryCode || !phone || !clientType || !services || services.length === 0) {
            return res.status(400).json({
                ok: false,
                error: 'All required fields must be provided'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid email address'
            });
        }

        // Phone validation (basic - should be 10 digits)
        if (phone.replace(/\D/g, '').length !== 10) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid phone number'
            });
        }

        // Client type validation
        if (!['personal', 'client'].includes(clientType)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid client type'
            });
        }

        // Get IP address and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Create lead capture entry
        const leadData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            countryCode: countryCode.trim(),
            phone: phone.trim(),
            clientType,
            services,
            message: message ? message.trim() : '',
            ipAddress,
            userAgent
        };

        const lead = await LeadCapture.create(leadData);

        const emailData = {
            name: lead.name,
            email: lead.email,
            phone: `${lead.countryCode} ${lead.phone}`,
            clientType: lead.clientType,
            services: lead.services,
            message: lead.message,
            submittedAt: lead.createdAt,
            leadId: lead._id
        };

        // Send confirmation email to customer (async, don't wait)
        sendLeadConfirmationEmail(emailData)
            .catch(err => console.error('Failed to send customer confirmation email:', err));

        // Send notification email to admin (async, don't wait)
        sendLeadNotificationEmail(emailData)
            .catch(err => console.error('Failed to send admin notification email:', err));

        res.status(201).json({
            ok: true,
            message: 'Thank you for your interest! We will contact you soon.',
            leadId: lead._id
        });

    } catch (error) {
        console.error('Lead capture submission error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to submit your request. Please try again later.'
        });
    }
};

// Get all lead captures (Admin only)
exports.getAllLeadCaptures = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && ['new', 'contacted', 'qualified', 'converted', 'archived'].includes(status)) {
            query.status = status;
        }

        const leads = await LeadCapture.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await LeadCapture.countDocuments(query);

        res.json({
            ok: true,
            leads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get lead captures error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch lead captures'
        });
    }
};

// Get single lead capture (Admin only)
exports.getLeadCaptureById = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await LeadCapture.findById(id).lean();

        if (!lead) {
            return res.status(404).json({
                ok: false,
                error: 'Lead capture not found'
            });
        }

        res.json({
            ok: true,
            lead
        });

    } catch (error) {
        console.error('Get lead capture by ID error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch lead capture'
        });
    }
};

// Update lead capture status (Admin only)
exports.updateLeadCaptureStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'archived'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid status'
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        if (status === 'contacted' && req.user) {
            updateData.contactedAt = new Date();
            updateData.contactedBy = req.user._id;
        }

        const lead = await LeadCapture.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({
                ok: false,
                error: 'Lead capture not found'
            });
        }

        res.json({
            ok: true,
            message: 'Lead capture updated successfully',
            lead
        });

    } catch (error) {
        console.error('Update lead capture status error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update lead capture'
        });
    }
};

// Delete lead capture (Admin only)
exports.deleteLeadCapture = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await LeadCapture.findByIdAndDelete(id);

        if (!lead) {
            return res.status(404).json({
                ok: false,
                error: 'Lead capture not found'
            });
        }

        res.json({
            ok: true,
            message: 'Lead capture deleted successfully'
        });

    } catch (error) {
        console.error('Delete lead capture error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to delete lead capture'
        });
    }
};

// Get lead capture statistics (Admin only)
exports.getLeadCaptureStats = async (req, res) => {
    try {
        const stats = await LeadCapture.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await LeadCapture.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await LeadCapture.countDocuments({
            createdAt: { $gte: today }
        });

        res.json({
            ok: true,
            stats: {
                total,
                today: todayCount,
                byStatus: stats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Get lead capture stats error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch lead capture statistics'
        });
    }
};
