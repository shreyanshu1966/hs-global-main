import React, { useState, useEffect } from 'react';
import { Truck, Plane, Package, Clock, DollarSign, Info, Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ShippingEstimate {
    cost: number;
    currency: string;
    transitDays: string;
    provider: string;
    serviceType: string;
    carrierName?: string;
    isFallback: boolean;
    breakdown: {
        baseEstimate: number;
        rangeMin: number;
        rangeMax: number;
        customerCharge: number;
        bufferAmount: number;
    };
    weight: {
        total: number;
        unit: string;
    };
    volume: {
        total: number;
        unit: string;
    };
    allQuotes?: Array<{
        carrier: string;
        price: number;
        transitDays: string;
        serviceLevel: string;
    }>;
}

interface ShippingEstimatorProps {
    items: any[];
    destination: {
        country: string;
        city: string;
        state: string;
        postalCode: string;
    };
    onEstimateChange?: (estimate: ShippingEstimate | null) => void;
}

const ShippingEstimator: React.FC<ShippingEstimatorProps> = ({
    items,
    destination,
    onEstimateChange
}) => {
    const [serviceType, setServiceType] = useState<'ocean' | 'air'>('ocean');
    const [estimate, setEstimate] = useState<ShippingEstimate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Fetch shipping estimate when destination or service type changes
    useEffect(() => {
        if (!destination.country || !destination.city || items.length === 0) {
            setEstimate(null);
            return;
        }

        const fetchEstimate = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_URL}/shipping/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        items,
                        destination,
                        serviceType
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch shipping estimate');
                }

                const data = await response.json();

                if (data.ok && data.shipping) {
                    setEstimate(data.shipping);
                    onEstimateChange?.(data.shipping);
                } else {
                    throw new Error(data.error || 'Failed to get shipping estimate');
                }
            } catch (err: any) {
                console.error('Shipping estimate error:', err);
                setError(err.message || 'Failed to calculate shipping cost');
                setEstimate(null);
                onEstimateChange?.(null);
            } finally {
                setLoading(false);
            }
        };

        // Debounce the API call
        const timeoutId = setTimeout(fetchEstimate, 500);
        return () => clearTimeout(timeoutId);
    }, [destination.country, destination.city, destination.state, destination.postalCode, serviceType, items]);

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-center gap-3 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Calculating shipping cost...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-red-900 mb-1">Shipping Estimate Error</h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!estimate) {
        return (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Shipping Information</h4>
                        <p className="text-sm text-blue-700">
                            Please fill in your complete shipping address to see shipping cost estimates.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Shipping Estimate
                </h3>
                <p className="text-sm text-blue-100">
                    {estimate.isFallback ? 'Estimated rates' : `Powered by ${estimate.provider}`}
                </p>
            </div>

            {/* Service Type Selector */}
            <div className="p-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Shipping Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setServiceType('ocean')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${serviceType === 'ocean'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Truck className={`w-5 h-5 ${serviceType === 'ocean' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="text-left flex-1">
                            <div className="font-semibold text-sm">Ocean Freight</div>
                            <div className="text-xs opacity-75">Economical</div>
                        </div>
                    </button>
                    <button
                        onClick={() => setServiceType('air')}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${serviceType === 'air'
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Plane className={`w-5 h-5 ${serviceType === 'air' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div className="text-left flex-1">
                            <div className="font-semibold text-sm">Air Freight</div>
                            <div className="text-xs opacity-75">Faster</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Estimate Details */}
            <div className="p-6 space-y-4">
                {/* Main Cost */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-medium">Shipping Cost</span>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {estimate.currency} {estimate.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        {estimate.breakdown && (
                            <div className="text-xs text-gray-500 mt-1">
                                Range: {estimate.currency} {estimate.breakdown.rangeMin.toFixed(2)} - {estimate.breakdown.rangeMax.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Transit Time */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Estimated Transit</span>
                    </div>
                    <span className="text-gray-900 font-semibold">{estimate.transitDays} days</span>
                </div>

                {/* Carrier Info */}
                {estimate.carrierName && (
                    <div className="flex items-center justify-between py-3 border-t border-gray-100">
                        <span className="text-gray-700 font-medium">Carrier</span>
                        <span className="text-gray-900 font-semibold">{estimate.carrierName}</span>
                    </div>
                )}

                {/* Weight & Volume */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Total Weight</div>
                        <div className="text-lg font-bold text-gray-900">
                            {estimate.weight.total.toFixed(2)} {estimate.weight.unit}
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Total Volume</div>
                        <div className="text-lg font-bold text-gray-900">
                            {estimate.volume.total.toFixed(3)} {estimate.volume.unit}
                        </div>
                    </div>
                </div>

                {/* Show Details Toggle */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Info className="w-4 h-4" />
                    {showDetails ? 'Hide Details' : 'Show Breakdown'}
                </button>

                {/* Detailed Breakdown */}
                {showDetails && estimate.breakdown && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Base Estimate:</span>
                            <span className="font-semibold text-gray-900">
                                {estimate.currency} {estimate.breakdown.baseEstimate.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price Range Min:</span>
                            <span className="font-semibold text-gray-900">
                                {estimate.currency} {estimate.breakdown.rangeMin.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price Range Max:</span>
                            <span className="font-semibold text-gray-900">
                                {estimate.currency} {estimate.breakdown.rangeMax.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Safety Buffer (15%):</span>
                            <span className="font-semibold text-gray-900">
                                {estimate.currency} {estimate.breakdown.bufferAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-bold text-gray-900">Your Charge:</span>
                            <span className="font-bold text-blue-600">
                                {estimate.currency} {estimate.breakdown.customerCharge.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Alternative Quotes */}
                {estimate.allQuotes && estimate.allQuotes.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Other Available Options</h4>
                        <div className="space-y-2">
                            {estimate.allQuotes.slice(1, 4).map((quote, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                                    <div>
                                        <div className="font-medium text-gray-900">{quote.carrier}</div>
                                        <div className="text-xs text-gray-600">{quote.transitDays} days • {quote.serviceLevel}</div>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {estimate.currency} {quote.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fallback Notice */}
                {estimate.isFallback && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                            <strong>Note:</strong> These are estimated rates. Final shipping costs will be confirmed after order placement.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingEstimator;
