const Contact = require('../models/Contact');
const { sendContactNotificationEmail, sendCustomerConfirmationEmail } = require('../services/emailService');

// Submit contact form
exports.submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message, referenceImage } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                ok: false,
                error: 'All required fields must be filled'
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

        // Get IP address and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Create contact inquiry
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            ipAddress,
            userAgent
        };

        // Add reference image if provided
        if (referenceImage) {
            contactData.referenceImage = referenceImage.trim();
        }

        const contact = await Contact.create(contactData);

        const emailData = {
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            referenceImage: contact.referenceImage,
            submittedAt: contact.createdAt,
            contactId: contact._id
        };

        // Send confirmation email to customer (async, don't wait)
        sendCustomerConfirmationEmail(emailData)
            .catch(err => console.error('Failed to send customer confirmation email:', err));

        // Send notification email to admin (async, don't wait)
        sendContactNotificationEmail(emailData)
            .catch(err => console.error('Failed to send admin notification email:', err));

        res.status(201).json({
            ok: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            contactId: contact._id
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to submit contact form. Please try again later.'
        });
    }
};

// Get all contact inquiries (Admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
            query.status = status;
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await Contact.countDocuments(query);

        res.json({
            ok: true,
            contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch contact inquiries'
        });
    }
};

// Get single contact inquiry (Admin only)
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id).lean();

        if (!contact) {
            return res.status(404).json({
                ok: false,
                error: 'Contact inquiry not found'
            });
        }

        // Mark as read if it's new
        if (contact.status === 'new') {
            await Contact.findByIdAndUpdate(id, { status: 'read' });
        }

        res.json({
            ok: true,
            contact
        });

    } catch (error) {
        console.error('Get contact by ID error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch contact inquiry'
        });
    }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const validStatuses = ['new', 'read', 'replied', 'archived'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid status'
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        if (status === 'replied' && req.user) {
            updateData.repliedAt = new Date();
            updateData.repliedBy = req.user._id;
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                ok: false,
                error: 'Contact inquiry not found'
            });
        }

        res.json({
            ok: true,
            message: 'Contact inquiry updated successfully',
            contact
        });

    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to update contact inquiry'
        });
    }
};

// Delete contact inquiry (Admin only)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                ok: false,
                error: 'Contact inquiry not found'
            });
        }

        res.json({
            ok: true,
            message: 'Contact inquiry deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to delete contact inquiry'
        });
    }
};

// Get contact statistics (Admin only)
exports.getContactStats = async (req, res) => {
    try {
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Contact.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await Contact.countDocuments({
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
        console.error('Get contact stats error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch contact statistics'
        });
    }
};
