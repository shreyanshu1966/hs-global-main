const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide name, email, and password'
            });
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide a valid email address'
            });
        }

        // Password complexity validation
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
        const minLength = 8;

        if (password.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return res.status(400).json({
                ok: false,
                error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        // Phone validation (optional)
        if (phone) {
            const phoneRegex = /^\+?[\d\s-]{10,15}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    ok: false,
                    error: 'Please provide a valid phone number'
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                ok: false,
                error: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || ''
        });

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        const emailResult = await emailService.sendVerificationEmail(
            user.email,
            user.name,
            verificationToken
        );

        if (!emailResult.success) {
            console.warn('⚠️ Failed to send verification email:', emailResult.error);
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data and token
        res.status(201).json({
            ok: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            token,
            user: user.toPublicJSON(),
            emailSent: emailResult.success
        });
    } catch (error) {
        console.error('Register error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            ok: false,
            error: 'Registration failed. Please try again.'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide email and password'
            });
        }

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                ok: false,
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                ok: false,
                error: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set cookie (optional, for additional security)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data and token
        res.json({
            ok: true,
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            ok: false,
            error: 'Login failed. Please try again.'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        // User is already attached to req by authMiddleware
        res.json({
            ok: true,
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to fetch profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, avatar } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.json({
            ok: true,
            message: 'Profile updated successfully',
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                error: messages.join(', ')
            });
        }

        res.status(500).json({
            ok: false,
            error: 'Failed to update profile'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide current and new password'
            });
        }

        // Password complexity validation
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /[0-9]/.test(newPassword);
        const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
        const minLength = 8;

        if (newPassword.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return res.status(400).json({
                ok: false,
                error: 'New password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                ok: false,
                error: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            ok: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to change password'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // Clear cookie
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.json({
            ok: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            ok: false,
            error: 'Logout failed'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const crypto = require('crypto');

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with this token and check if not expired
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid or expired verification token'
            });
        }

        // Update user
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({
            ok: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            ok: false,
            error: 'Email verification failed'
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.emailVerified) {
            return res.status(400).json({
                ok: false,
                error: 'Email is already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        // Send verification email
        const emailResult = await emailService.sendVerificationEmail(
            user.email,
            user.name,
            verificationToken
        );

        if (!emailResult.success) {
            return res.status(500).json({
                ok: false,
                error: 'Failed to send verification email'
            });
        }

        res.json({
            ok: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to resend verification email'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return res.json({
                ok: true,
                message: 'If an account exists with this email, a password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send reset email
        const emailResult = await emailService.sendPasswordResetEmail(
            user.email,
            user.name,
            resetToken
        );

        if (!emailResult.success) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                ok: false,
                error: 'Failed to send password reset email'
            });
        }

        res.json({
            ok: true,
            message: 'If an account exists with this email, a password reset link has been sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to process password reset request'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                ok: false,
                error: 'Password must be at least 6 characters'
            });
        }

        const crypto = require('crypto');

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with this token and check if not expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                ok: false,
                error: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Generate new JWT token
        const jwtToken = generateToken(user._id);

        res.json({
            ok: true,
            message: 'Password reset successful',
            token: jwtToken,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to reset password'
        });
    }
};

// @desc    Request OTP for login
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return res.json({
                ok: true,
                message: 'If an account exists with this email, an OTP has been sent'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database (reuse OTP model)
        const Otp = require('../models/Otp');
        await Otp.create({
            email: user.email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        });

        // Send OTP email
        const emailResult = await emailService.sendOTPEmail(
            user.email,
            user.name,
            otp
        );

        if (!emailResult.success) {
            return res.status(500).json({
                ok: false,
                error: 'Failed to send OTP email'
            });
        }

        res.json({
            ok: true,
            message: 'If an account exists with this email, an OTP has been sent'
        });
    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({
            ok: false,
            error: 'Failed to send OTP'
        });
    }
};

// @desc    Login with OTP
// @route   POST /api/auth/login-otp
// @access  Public
exports.loginWithOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                ok: false,
                error: 'Please provide email and OTP'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                ok: false,
                error: 'Invalid email or OTP'
            });
        }

        // Verify OTP
        const Otp = require('../models/Otp');
        const otpRecord = await Otp.findOne({
            email: user.email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(401).json({
                ok: false,
                error: 'Invalid or expired OTP'
            });
        }

        // Delete used OTP
        await Otp.deleteOne({ _id: otpRecord._id });

        // Generate JWT token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            ok: true,
            message: 'Login successful',
            token,
            user: user.toPublicJSON()
        });
    } catch (error) {
        console.error('OTP login error:', error);
        res.status(500).json({
            ok: false,
            error: 'Login failed'
        });
    }
};
