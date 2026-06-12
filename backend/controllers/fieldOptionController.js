const FieldOption = require('../models/FieldOption');

/** GET /api/field-options/:fieldKey — returns all saved custom values for a field */
exports.listFieldOptions = async (req, res) => {
    try {
        const options = await FieldOption.find({ fieldKey: req.params.fieldKey })
            .sort({ value: 1 })
            .select('value -_id');
        res.json({ ok: true, values: options.map(o => o.value) });
    } catch {
        res.status(500).json({ ok: false, message: 'Failed to list field options' });
    }
};

/** POST /api/field-options — upsert a custom value for a field */
exports.saveFieldOption = async (req, res) => {
    try {
        const { fieldKey, value } = req.body;
        if (!fieldKey?.trim() || !value?.trim()) {
            return res.status(400).json({ ok: false, message: 'fieldKey and value are required' });
        }
        await FieldOption.findOneAndUpdate(
            { fieldKey: fieldKey.trim(), value: value.trim() },
            { fieldKey: fieldKey.trim(), value: value.trim() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(201).json({ ok: true });
    } catch {
        res.status(500).json({ ok: false, message: 'Failed to save field option' });
    }
};
