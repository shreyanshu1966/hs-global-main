const SpecKey = require('../models/SpecKey');

/** GET /api/spec-keys — public, returns all saved labels */
exports.listSpecKeys = async (req, res) => {
    try {
        const keys = await SpecKey.find().sort({ label: 1 }).select('label _id');
        res.json({ ok: true, keys });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Failed to list spec keys' });
    }
};

/** POST /api/admin/spec-keys — admin, create a key manually */
exports.createSpecKey = async (req, res) => {
    try {
        const { label } = req.body;
        if (!label || !label.trim()) {
            return res.status(400).json({ ok: false, message: 'label is required' });
        }
        const key = await SpecKey.findOneAndUpdate(
            { label: label.trim() },
            { label: label.trim() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json({ ok: true, key });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Failed to create spec key' });
    }
};

/** DELETE /api/admin/spec-keys/:id — admin */
exports.deleteSpecKey = async (req, res) => {
    try {
        const key = await SpecKey.findByIdAndDelete(req.params.id);
        if (!key) return res.status(404).json({ ok: false, message: 'Spec key not found' });
        res.json({ ok: true, message: 'Spec key deleted' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Failed to delete spec key' });
    }
};
