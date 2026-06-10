const NavbarConfig = require('../models/NavbarConfig');

const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// GET /api/navbar/config — public, returns all category configs keyed by categoryId
const getAllNavbarConfigs = async (req, res) => {
    try {
        const configs = await NavbarConfig.find({});
        const result = {};
        configs.forEach((c) => { result[c.categoryId] = c.toObject(); });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch navbar config', error: err.message });
    }
};

// PUT /api/navbar/config/:categoryId — admin only, replaces full config
const saveNavbarConfig = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName, sections } = req.body;

        if (!categoryId || !categoryName) {
            return res.status(400).json({ success: false, message: 'categoryId and categoryName are required' });
        }

        if (!Array.isArray(sections)) {
            return res.status(400).json({ success: false, message: 'sections must be an array' });
        }

        // Validate + normalise sections
        const cleanSections = sections.map((section, si) => {
            if (!section.title || typeof section.title !== 'string') {
                throw new Error(`Section ${si + 1} is missing a title`);
            }
            const sectionId = section.id || slugify(section.title) || `section-${si}`;
            const items = (section.items || []).map((item, ii) => {
                if (!item.label || typeof item.label !== 'string') {
                    throw new Error(`Item ${ii + 1} in section "${section.title}" is missing a label`);
                }
                const itemSlug = item.slug || slugify(item.label) || `item-${ii}`;
                return {
                    id: item.id || itemSlug,
                    label: item.label.trim(),
                    slug: itemSlug,
                };
            });
            return { id: sectionId, title: section.title.trim(), items };
        });

        const config = await NavbarConfig.findOneAndUpdate(
            { categoryId },
            { categoryId, categoryName: categoryName.trim(), sections: cleanSections, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: config });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Failed to save navbar config' });
    }
};

module.exports = { getAllNavbarConfigs, saveNavbarConfig };
