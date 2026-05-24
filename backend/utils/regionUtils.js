const REGIONS = ['UAE', 'Europe', 'India', 'USA', 'UK'];

// Display currency for each region (only INR, USD, GBP on the website)
const REGION_CURRENCIES = {
    UAE: 'USD',
    Europe: 'GBP',
    India: 'INR',
    USA: 'USD',
    UK: 'GBP',
    default: 'USD'
};

// Country code → region mapping
const COUNTRY_TO_REGION = {
    // UAE
    AE: 'UAE',
    // India
    IN: 'India',
    // USA
    US: 'USA',
    // UK
    GB: 'UK',
    // Europe
    DE: 'Europe', FR: 'Europe', IT: 'Europe', ES: 'Europe', NL: 'Europe',
    BE: 'Europe', AT: 'Europe', PT: 'Europe', IE: 'Europe', GR: 'Europe',
    FI: 'Europe', SE: 'Europe', DK: 'Europe', NO: 'Europe', PL: 'Europe',
    CH: 'Europe', CZ: 'Europe', HU: 'Europe', RO: 'Europe', SK: 'Europe',
    SI: 'Europe', HR: 'Europe', BG: 'Europe', LT: 'Europe', LV: 'Europe',
    EE: 'Europe', MT: 'Europe', CY: 'Europe', LU: 'Europe'
};

function getRegionFromCountry(countryCode) {
    if (!countryCode) return 'default';
    return COUNTRY_TO_REGION[countryCode.toUpperCase()] || 'default';
}

function getCurrencyForRegion(region) {
    return REGION_CURRENCIES[region] || 'USD';
}

module.exports = { REGIONS, REGION_CURRENCIES, COUNTRY_TO_REGION, getRegionFromCountry, getCurrencyForRegion };
