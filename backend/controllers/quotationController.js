const Quotation = require('../models/Quotation');
const { sendQuotationNotificationEmail, sendQuotationConfirmationEmail } = require('../services/emailService');

// Submit quotation request
exports.submitQuotationRequest = async (req, res) => {
    try {
        const { name, email, mobile, productName, finish, thickness, requirement } = req.body;

        // Validation
        if (!name || !email || !mobile || !productName || !finish || !thickness || !requirement) {
            return res.status(400).json({
                ok: false,
                error: 'All fields are required'
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

        // Mobile validation (basic)
        const mobileRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid mobile number'
            });
        }

        // Requirement validation
        if (requirement < 1) {
            return res.status(400).json({
                ok: false,
                error: 'Requirement must be at least 1 sq ft'
            });
        }

        // Get IP address and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Create quotation request
        const quotationData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            productName: productName.trim(),
            finish: finish.trim(),
            thickness: thickness.trim(),
            requirement: parseInt(requirement),
            ipAddress,
            userAgent
        };

        const quotation = await Quotation.create(quotationData);

        const emailData = {
            name: quotation.name,
            email: quotation.email,
            mobile: quotation.mobile,
            productName: quotation.productName,
            finish: quotation.finish,
            thickness: quotation.thickness,
            requirement: quotation.requirement,
            submittedAt: quotation.createdAt,
            quotationId: quotation._id
        };

        // Send confirmation email to customer (async, don't wait)
        sendQuotationConfirmationEmail(emailData)
            .catch(err => console.error('Failed to send customer confirmation email:', err));

        // Send notification email to admin (async, don't wait)
        sendQuotationNotificationEmail(emailData)
            .catch(err => console.error('Failed to send admin notification email:', err));

        res.status(201).json({
            ok: true,
            message: 'Quotation request submitted successfully. We will contact you soon!',
            quotationId: quotation._id
        });

    } catch (error) {
        console.error('Quotation request submission error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to submit quotation request. Please try again later.'
        });
    }
};

// Get all quotation requests (Admin only)
exports.getAllQuotations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && ['new', 'quoted', 'contacted', 'archived'].includes(status)) {
            query.status = status;
        }

        const quotations = await Quotation.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Quotation.countDocuments(query);

        res.json({
            ok: true,
            quotations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get quotations error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch quotation requests'
        });
    }
};

// Get single quotation request (Admin only)
exports.getQuotationById = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findById(id).lean();

        if (!quotation) {
            return res.status(404).json({
                ok: false,
                error: 'Quotation request not found'
            });
        }

        res.json({
            ok: true,
            quotation
        });

    } catch (error) {
        console.error('Get quotation by ID error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch quotation request'
        });
    }
};

// Update quotation status (Admin only)
exports.updateQuotationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, quotedPrice } = req.body;

        const validStatuses = ['new', 'quoted', 'contacted', 'archived'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid status'
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        if (quotedPrice !== undefined) updateData.quotedPrice = quotedPrice;

        if (status === 'quoted' && req.user) {
            updateData.quotedAt = new Date();
            updateData.quotedBy = req.user._id;
        }

        const quotation = await Quotation.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!quotation) {
            return res.status(404).json({
                ok: false,
                error: 'Quotation request not found'
            });
        }

        res.json({
            ok: true,
            message: 'Quotation request updated successfully',
            quotation
        });

    } catch (error) {
        console.error('Update quotation status error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update quotation request'
        });
    }
};

// Delete quotation request (Admin only)
exports.deleteQuotation = async (req, res) => {
    try {
        const { id } = req.params;

        const quotation = await Quotation.findByIdAndDelete(id);

        if (!quotation) {
            return res.status(404).json({
                ok: false,
                error: 'Quotation request not found'
            });
        }

        res.json({
            ok: true,
            message: 'Quotation request deleted successfully'
        });

    } catch (error) {
        console.error('Delete quotation error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to delete quotation request'
        });
    }
};

// Get quotation statistics (Admin only)
exports.getQuotationStats = async (req, res) => {
    try {
        const stats = await Quotation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Quotation.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await Quotation.countDocuments({
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
        console.error('Get quotation stats error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch quotation statistics'
        });
    }
};
