const axios = require('axios');

/**
 * Shipping Service
 * Handles shipping cost estimation using Freightos API with fallback to manual rates
 */
class ShippingService {
    constructor() {
        this.freightosApiKey = process.env.FREIGHTOS_API_KEY;
        this.freightosApiUrl = process.env.FREIGHTOS_API_URL || 'https://api.freightos.com/v1';
        this.useFreightosAPI = !!this.freightosApiKey;

        // Warehouse origin (HS Global Export location)
        this.origin = {
            country: 'IN',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380051',
            address: 'C-108, Titanium Business Park, Makarba'
        };

        // Fallback shipping rates by region (in USD)
        this.fallbackRates = {
            'India': {
                base: 50,
                perKg: 0.5,
                perCubicMeter: 30,
                transitDays: '3-7'
            },
            'USA': {
                base: 500,
                perKg: 2.5,
                perCubicMeter: 150,
                transitDays: '15-25'
            },
            'Canada': {
                base: 550,
                perKg: 2.8,
                perCubicMeter: 160,
                transitDays: '15-25'
            },
            'United Kingdom': {
                base: 600,
                perKg: 3.0,
                perCubicMeter: 180,
                transitDays: '12-20'
            },
            'Europe': {
                base: 600,
                perKg: 3.0,
                perCubicMeter: 180,
                transitDays: '12-20'
            },
            'United Arab Emirates': {
                base: 400,
                perKg: 2.0,
                perCubicMeter: 120,
                transitDays: '7-14'
            },
            'Middle East': {
                base: 400,
                perKg: 2.0,
                perCubicMeter: 120,
                transitDays: '7-14'
            },
            'Australia': {
                base: 700,
                perKg: 3.5,
                perCubicMeter: 200,
                transitDays: '18-28'
            },
            'Singapore': {
                base: 450,
                perKg: 2.2,
                perCubicMeter: 130,
                transitDays: '10-18'
            },
            'Asia': {
                base: 450,
                perKg: 2.2,
                perCubicMeter: 130,
                transitDays: '10-18'
            },
            'Default': {
                base: 500,
                perKg: 2.5,
                perCubicMeter: 150,
                transitDays: '15-30'
            }
        };
    }

    /**
     * Calculate total weight of order items
     * @param {Array} items - Cart items
     * @returns {number} Total weight in kg
     */
    calculateTotalWeight(items) {
        return items.reduce((total, item) => {
            // Weight estimates based on product category
            let weightPerUnit = 1; // Default 1kg for tiles/small items

            if (item.category === 'slabs' || item.category === 'Slabs') {
                weightPerUnit = 25; // Granite/marble slabs typically 25kg each
            } else if (item.category === 'tiles' || item.category === 'Tiles') {
                weightPerUnit = 1.5; // Tiles typically 1.5kg per piece
            } else if (item.category === 'blocks' || item.category === 'Blocks') {
                weightPerUnit = 500; // Large blocks
            }

            return total + (weightPerUnit * item.quantity);
        }, 0);
    }

    /**
     * Calculate total volume of order items
     * @param {Array} items - Cart items
     * @returns {number} Total volume in cubic meters
     */
    calculateTotalVolume(items) {
        return items.reduce((total, item) => {
            // Volume estimates based on product category (in m³)
            let volumePerUnit = 0.001; // Default small volume

            if (item.category === 'slabs' || item.category === 'Slabs') {
                volumePerUnit = 0.05; // Standard slab ~0.05 m³
            } else if (item.category === 'tiles' || item.category === 'Tiles') {
                volumePerUnit = 0.002; // Tiles ~0.002 m³
            } else if (item.category === 'blocks' || item.category === 'Blocks') {
                volumePerUnit = 1.0; // Large blocks ~1 m³
            }

            return total + (volumePerUnit * item.quantity);
        }, 0);
    }

    /**
     * Map country to region for fallback rates
     * @param {string} country - Country name
     * @returns {string} Region name
     */
    getRegion(country) {
        const countryToRegion = {
            'India': 'India',
            'United States': 'USA',
            'USA': 'USA',
            'Canada': 'Canada',
            'United Kingdom': 'United Kingdom',
            'UK': 'United Kingdom',
            'Germany': 'Europe',
            'France': 'Europe',
            'Italy': 'Europe',
            'Spain': 'Europe',
            'Netherlands': 'Europe',
            'Belgium': 'Europe',
            'United Arab Emirates': 'United Arab Emirates',
            'UAE': 'United Arab Emirates',
            'Saudi Arabia': 'Middle East',
            'Qatar': 'Middle East',
            'Kuwait': 'Middle East',
            'Australia': 'Australia',
            'Singapore': 'Singapore',
            'China': 'Asia',
            'Japan': 'Asia',
            'South Korea': 'Asia',
            'Thailand': 'Asia',
            'Malaysia': 'Asia'
        };

        return countryToRegion[country] || 'Default';
    }

    /**
     * Get shipping estimate from Freightos API
     * @param {Object} orderDetails - Order details
     * @param {string} serviceType - 'ocean' or 'air' freight
     * @returns {Promise<Object>} Shipping estimate
     */
    async getFreightosEstimate(orderDetails, serviceType = 'ocean') {
        try {
            // Freightos API endpoint for rate quotes
            const endpoint = `${this.freightosApiUrl}/quotes`;

            const requestBody = {
                origin: {
                    country_code: this.origin.country,
                    city: this.origin.city,
                    postal_code: this.origin.postalCode,
                    address: this.origin.address
                },
                destination: {
                    country_code: orderDetails.countryCode || this.getCountryCode(orderDetails.country),
                    city: orderDetails.city,
                    postal_code: orderDetails.postalCode,
                    state: orderDetails.state
                },
                shipment: {
                    // Weight in kg
                    weight: {
                        value: orderDetails.totalWeight,
                        unit: 'kg'
                    },
                    // Volume in cubic meters
                    volume: {
                        value: orderDetails.totalVolume,
                        unit: 'cbm'
                    },
                    // Cargo details
                    cargo_type: 'general',
                    commodity: 'granite_marble_stone',
                    packaging: 'crate',
                    // Incoterms (International Commercial Terms)
                    incoterm: 'FOB' // Free On Board
                },
                // Service type: 'ocean' or 'air'
                service_type: serviceType,
                // Request multiple quotes for comparison
                include_options: true
            };

            console.log('Requesting Freightos quote:', JSON.stringify(requestBody, null, 2));

            const response = await axios.post(endpoint, requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.freightosApiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000 // 15 second timeout
            });

            console.log('Freightos API response:', response.data);

            // Parse Freightos response
            if (response.data && response.data.quotes && response.data.quotes.length > 0) {
                // Get the best (lowest) quote
                const bestQuote = response.data.quotes.reduce((min, quote) =>
                    quote.total_price < min.total_price ? quote : min
                );

                // Calculate price range from all quotes
                const prices = response.data.quotes.map(q => q.total_price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                return {
                    success: true,
                    estimatedCost: bestQuote.total_price,
                    minCost: minPrice,
                    maxCost: maxPrice,
                    transitDays: bestQuote.transit_time || '15-30',
                    currency: bestQuote.currency || 'USD',
                    provider: 'freightos',
                    serviceType: serviceType,
                    carrierName: bestQuote.carrier_name || 'Multiple carriers',
                    isFallback: false,
                    quoteId: bestQuote.quote_id,
                    allQuotes: response.data.quotes.map(q => ({
                        carrier: q.carrier_name,
                        price: q.total_price,
                        transitDays: q.transit_time,
                        serviceLevel: q.service_level
                    }))
                };
            }

            // If no quotes returned, throw error to trigger fallback
            throw new Error('No quotes available from Freightos');
        } catch (error) {
            if (error.response) {
                console.error('Freightos API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
            } else {
                console.error('Freightos API error:', error.message);
            }
            return null; // Return null to trigger fallback
        }
    }

    /**
     * Get country code from country name
     * @param {string} country - Country name
     * @returns {string} ISO country code
     */
    getCountryCode(country) {
        const countryCodeMap = {
            'India': 'IN',
            'United States': 'US',
            'USA': 'US',
            'Canada': 'CA',
            'United Kingdom': 'GB',
            'UK': 'GB',
            'Germany': 'DE',
            'France': 'FR',
            'Italy': 'IT',
            'Spain': 'ES',
            'Netherlands': 'NL',
            'Belgium': 'BE',
            'United Arab Emirates': 'AE',
            'UAE': 'AE',
            'Saudi Arabia': 'SA',
            'Qatar': 'QA',
            'Kuwait': 'KW',
            'Australia': 'AU',
            'Singapore': 'SG',
            'China': 'CN',
            'Japan': 'JP',
            'South Korea': 'KR',
            'Thailand': 'TH',
            'Malaysia': 'MY'
        };
        return countryCodeMap[country] || 'US';
    }

    /**
     * Calculate shipping estimate using fallback rates
     * @param {Object} orderDetails - Order details
     * @returns {Object} Shipping estimate
     */
    getFallbackEstimate(orderDetails) {
        const region = this.getRegion(orderDetails.country);
        const rates = this.fallbackRates[region] || this.fallbackRates.Default;

        // Calculate based on weight and volume (use whichever is higher)
        const weightBasedCost = rates.base + (orderDetails.totalWeight * rates.perKg);
        const volumeBasedCost = rates.base + (orderDetails.totalVolume * rates.perCubicMeter);

        const estimatedCost = Math.max(weightBasedCost, volumeBasedCost);

        return {
            success: true,
            estimatedCost: Math.round(estimatedCost * 100) / 100, // Round to 2 decimals
            minCost: Math.round(estimatedCost * 0.85 * 100) / 100,
            maxCost: Math.round(estimatedCost * 1.15 * 100) / 100,
            transitDays: rates.transitDays,
            currency: 'USD',
            provider: 'fallback',
            isFallback: true,
            region: region
        };
    }

    /**
     * Get shipping estimate for an order
     * @param {Object} params - Parameters
     * @param {Array} params.items - Cart items
     * @param {Object} params.destination - Destination address
     * @param {string} params.serviceType - 'ocean' or 'air' (default: 'ocean')
     * @returns {Promise<Object>} Shipping estimate with buffer
     */
    async getShippingEstimate({ items, destination, serviceType = 'ocean' }) {
        try {
            // Calculate order dimensions
            const totalWeight = this.calculateTotalWeight(items);
            const totalVolume = this.calculateTotalVolume(items);

            const orderDetails = {
                country: destination.country,
                city: destination.city,
                state: destination.state,
                postalCode: destination.postalCode,
                totalWeight,
                totalVolume
            };

            // Try Freightos API first if configured
            let estimate = null;
            if (this.useFreightosAPI) {
                estimate = await this.getFreightosEstimate(orderDetails, serviceType);
            }

            // Fallback to manual rates if API fails or not configured
            if (!estimate) {
                estimate = this.getFallbackEstimate(orderDetails);
            }

            // Add 15% buffer to max cost for customer charge
            // This protects against price fluctuations and covers handling
            const bufferMultiplier = 1.15;
            const chargeAmount = Math.round(estimate.maxCost * bufferMultiplier * 100) / 100;

            return {
                ...estimate,
                chargeAmount, // Amount to charge customer
                buffer: '15%',
                breakdown: {
                    baseEstimate: estimate.estimatedCost,
                    rangeMin: estimate.minCost,
                    rangeMax: estimate.maxCost,
                    customerCharge: chargeAmount,
                    bufferAmount: Math.round((chargeAmount - estimate.maxCost) * 100) / 100
                },
                weight: {
                    total: totalWeight,
                    unit: 'kg'
                },
                volume: {
                    total: totalVolume,
                    unit: 'm³'
                },
                serviceType: serviceType
            };

        } catch (error) {
            console.error('Shipping estimation error:', error);
            throw new Error('Failed to calculate shipping cost');
        }
    }

    /**
     * Convert shipping cost from USD to other currencies
     * @param {number} amountUSD - Amount in USD
     * @param {string} targetCurrency - Target currency code
     * @returns {number} Converted amount
     */
    convertCurrency(amountUSD, targetCurrency) {
        // Simple conversion rates (you should use a real exchange rate API)
        const rates = {
            'USD': 1,
            'INR': 83.5,
            'EUR': 0.92,
            'GBP': 0.79,
            'AUD': 1.52,
            'CAD': 1.36,
            'AED': 3.67
        };

        const rate = rates[targetCurrency] || 1;
        return Math.round(amountUSD * rate * 100) / 100;
    }
}

module.exports = new ShippingService();
