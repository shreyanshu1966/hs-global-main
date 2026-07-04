/**
 * Image processing worker for offloading heavy operations from main thread
 * This prevents UI blocking during image manipulation
 */

self.addEventListener('message', (e: MessageEvent) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'SORT_IMAGES':
            const sorted = sortImages(payload.images, payload.category);
            self.postMessage({ type: 'SORT_IMAGES_RESULT', payload: sorted });
            break;

        case 'FILTER_PRODUCTS':
            const filtered = filterProducts(payload.products, payload.criteria);
            self.postMessage({ type: 'FILTER_PRODUCTS_RESULT', payload: filtered });
            break;

        default:
            console.warn('Unknown worker message type:', type);
    }
});

function sortImages(images: string[], category: string): string[] {
    if (category !== 'furniture') {
        const stand = images.filter(img => img.toLowerCase().includes('/stand/'));
        const others = images.filter(img => !img.toLowerCase().includes('/stand/'));
        return [...stand, ...others];
    }

    const patterns = [
        /^1\./i, /^01\./i, /main/i, /cover/i, /primary/i, /_01\./i, /^1-/i,
        /stand/i, /front/i, /hero/i, /^a\./i
    ];

    const score = (img: string) => {
        const name = img.split('/').pop()?.toLowerCase() || '';
        for (let i = 0; i < patterns.length; i++) {
            if (patterns[i].test(name)) return i;
        }
        const num = name.match(/^(\d+)\./);
        return num ? 1000 + Number(num[1]) : 10000;
    };

    return [...images].sort((a, b) => score(a) - score(b));
}

function filterProducts(products: any[], criteria: any): any[] {
    return products.filter(product => {
        if (criteria.category && product.category !== criteria.category) return false;
        if (criteria.available !== undefined && product.available !== criteria.available) return false;
        if (criteria.minPrice && product.priceINR < criteria.minPrice) return false;
        if (criteria.maxPrice && product.priceINR > criteria.maxPrice) return false;
        return true;
    });
}

export { };
