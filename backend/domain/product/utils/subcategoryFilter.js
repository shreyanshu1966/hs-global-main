const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SUBCATEGORY_ALIAS_MAP = {
    others: 'other'
};

const normalizeSubcategory = (subcategory) => {
    if (!subcategory || typeof subcategory !== 'string') {
        return '';
    }

    return subcategory.trim().toLowerCase();
};

const buildSubcategoryFilter = (subcategory) => {
    if (!subcategory || typeof subcategory !== 'string') {
        return undefined;
    }

    // Support for comma-separated multiple subcategories
    if (subcategory.includes(',')) {
        const subcategories = subcategory.split(',').map(s => normalizeSubcategory(s)).filter(Boolean);
        if (subcategories.length === 0) return undefined;
        
        const regexes = subcategories.map(sub => {
            const canonical = SUBCATEGORY_ALIAS_MAP[sub] || sub;
            const escaped = escapeRegex(canonical);
            const flexiblePattern = escaped.replace(/[-_\s]+/g, '[-_\\s]*');
            return new RegExp(`^${flexiblePattern}$`, 'i');
        });
        
        return { $in: regexes };
    }

    const normalized = normalizeSubcategory(subcategory);
    if (!normalized) {
        return undefined;
    }

    const canonical = SUBCATEGORY_ALIAS_MAP[normalized] || normalized;
    const escaped = escapeRegex(canonical);
    const flexiblePattern = escaped.replace(/[-_\s]+/g, '[-_\\s]*');

    return {
        $regex: `^${flexiblePattern}$`,
        $options: 'i'
    };
};

module.exports = {
    SUBCATEGORY_ALIAS_MAP,
    normalizeSubcategory,
    buildSubcategoryFilter
};
