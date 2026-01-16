# Quotation System Implementation - Admin Panel Integration Guide

## Overview
This guide explains how to add the Quotations tab to the Admin panel to view and manage slab quotation requests.

## Changes Required in Admin.tsx

### 1. Import the Quotation Service
Add this import at the top of the file (around line 49):

```typescript
import quotationService, { Quotation, QuotationStats } from '../services/quotationService';
```

### 2. Update the activeTab Type (line 111)
Change:
```typescript
const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'blogs' | 'contacts'>('analytics');
```

To:
```typescript
const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'users' | 'blogs' | 'contacts' | 'quotations'>('analytics');
```

### 3. Add Quotations State Variables (after line 150)
Add these state variables:

```typescript
// Quotations state
const [quotations, setQuotations] = useState<Quotation[]>([]);
const [quotationsPage, setQuotationsPage] = useState(1);
const [quotationsPagination, setQuotationsPagination] = useState<any>(null);
const [quotationsStatusFilter, setQuotationsStatusFilter] = useState('');
const [quotationStats, setQuotationStats] = useState<QuotationStats | null>(null);
const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
const [showQuotationModal, setShowQuotationModal] = useState(false);
```

### 4. Update useEffect Dependencies (line 158)
Add `quotationsPage` and `quotationsStatusFilter` to the dependency array.

### 5. Add Quotations Data Loading (in loadData function, around line 194)
Add this condition:

```typescript
} else if (activeTab === 'quotations') {
    const [quotationsData, statsData] = await Promise.all([
        quotationService.getAllQuotations(quotationsPage, 10, quotationsStatusFilter),
        quotationService.getQuotationStats()
    ]);
    setQuotations(quotationsData.quotations);
    setQuotationsPagination(quotationsData.pagination);
    setQuotationStats(statsData);
}
```

### 6. Add Handler Functions (after line 306)
Add these functions:

```typescript
const handleUpdateQuotationStatus = async (quotationId: string, status: string, adminNotes?: string, quotedPrice?: number) => {
    try {
        await quotationService.updateQuotationStatus(quotationId, status, adminNotes, quotedPrice);
        loadData();
        setShowQuotationModal(false);
        setSelectedQuotation(null);
        alert('Quotation status updated successfully');
    } catch (error: any) {
        alert(error.message);
    }
};

const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('Are you sure you want to delete this quotation request?')) return;

    try {
        await quotationService.deleteQuotation(quotationId);
        loadData();
        alert('Quotation request deleted successfully');
    } catch (error: any) {
        alert(error.message);
    }
};

const handleViewQuotation = async (quotationId: string) => {
    try {
        const quotation = await quotationService.getQuotationById(quotationId);
        setSelectedQuotation(quotation);
        setShowQuotationModal(true);
    } catch (error: any) {
        alert(error.message);
    }
};
```

### 7. Add Quotations Tab Button (in the tabs grid, after line 453)
Add this button after the Contacts tab button:

```tsx
<button
    onClick={() => setActiveTab('quotations')}
    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium text-sm transition-all ${activeTab === 'quotations'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-gray-600 hover:bg-gray-50'
        }`}
>
    <FileText className="w-4 h-4" />
    <span>Quotations</span>
</button>
```

Note: You'll need to update the grid-cols from `grid-cols-5` to `grid-cols-6`.

### 8. Add Quotations Tab Content (after the Contacts Tab section, around line 1174)
Add this complete section:

```tsx
{/* Quotations Tab */}
{activeTab === 'quotations' && (
    <div className="space-y-6">
        {/* Stats Cards */}
        {quotationStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Requests</h3>
                    <p className="text-2xl font-bold text-gray-900">{quotationStats.total}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Today</h3>
                    <p className="text-2xl font-bold text-blue-600">{quotationStats.today}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">New</h3>
                    <p className="text-2xl font-bold text-green-600">{quotationStats.byStatus.new || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Quoted</h3>
                    <p className="text-2xl font-bold text-purple-600">{quotationStats.byStatus.quoted || 0}</p>
                </div>
            </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <select
                value={quotationsStatusFilter}
                onChange={(e) => {
                    setQuotationsStatusFilter(e.target.value);
                    setQuotationsPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="quoted">Quoted</option>
                <option value="contacted">Contacted</option>
                <option value="archived">Archived</option>
            </select>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specs</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {quotations.map((quotation) => (
                            <tr key={quotation._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{quotation.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">{quotation.email}</div>
                                    <div className="text-xs text-gray-500">{quotation.mobile}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">{quotation.productName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs text-gray-600">
                                        <div>Finish: {quotation.finish}</div>
                                        <div>Thickness: {quotation.thickness}</div>
                                        <div>Qty: {quotation.requirement} sq ft</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        quotation.status === 'new' ? 'bg-green-100 text-green-800' :
                                        quotation.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                                        quotation.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {quotation.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(quotation.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewQuotation(quotation._id)}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuotation(quotation._id)}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {quotationsPagination && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <button
                        onClick={() => setQuotationsPage(quotationsPage - 1)}
                        disabled={quotationsPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page {quotationsPage} of {quotationsPagination.pages}
                    </span>
                    <button
                        onClick={() => setQuotationsPage(quotationsPage + 1)}
                        disabled={quotationsPage === quotationsPagination.pages}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
)}

{/* Quotation Detail Modal */}
{showQuotationModal && selectedQuotation && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Quotation Request Details</h2>
                <button
                    onClick={() => {
                        setShowQuotationModal(false);
                        setSelectedQuotation(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <p className="text-gray-900">{selectedQuotation.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{selectedQuotation.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                        <p className="text-gray-900">{selectedQuotation.mobile}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={selectedQuotation.status}
                            onChange={(e) => setSelectedQuotation({ ...selectedQuotation, status: e.target.value as any })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="new">New</option>
                            <option value="quoted">Quoted</option>
                            <option value="contacted">Contacted</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Product Specifications */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Specifications</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Product:</span>
                            <span className="font-medium">{selectedQuotation.productName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Finish:</span>
                            <span className="font-medium">{selectedQuotation.finish}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Thickness:</span>
                            <span className="font-medium">{selectedQuotation.thickness}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Requirement:</span>
                            <span className="font-medium">{selectedQuotation.requirement} sq ft</span>
                        </div>
                    </div>
                </div>

                {/* Admin Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                        value={selectedQuotation.adminNotes || ''}
                        onChange={(e) => setSelectedQuotation({ ...selectedQuotation, adminNotes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add internal notes..."
                    />
                </div>

                {/* Quoted Price */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quoted Price (₹)</label>
                    <input
                        type="number"
                        value={selectedQuotation.quotedPrice || ''}
                        onChange={(e) => setSelectedQuotation({ ...selectedQuotation, quotedPrice: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter quoted price"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    <button
                        onClick={() => handleUpdateQuotationStatus(
                            selectedQuotation._id,
                            selectedQuotation.status,
                            selectedQuotation.adminNotes,
                            selectedQuotation.quotedPrice
                        )}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Update Quotation
                    </button>
                    <button
                        onClick={() => {
                            setShowQuotationModal(false);
                            setSelectedQuotation(null);
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
```

## Testing the Implementation

1. **Test the Form:**
   - Navigate to a slab product
   - Click "Request Quotation"
   - Fill in all fields (name, email, mobile, finish, thickness, requirement)
   - Submit the form
   - Check that you receive confirmation

2. **Test Email Notifications:**
   - Check admin email for quotation notification
   - Check customer email for confirmation

3. **Test Admin Panel:**
   - Login as admin
   - Navigate to Quotations tab
   - View quotation details
   - Update status and add notes
   - Test filtering by status

## Environment Variables
Make sure these are set in your `.env` file:
- `EMAIL_USER` - Email address for sending
- `EMAIL_PASSWORD` - Email password/app password
- `EMAIL_TO` - Admin email to receive quotations
- `EMAIL_FROM` - From email address
- `FRONTEND_URL` - Your frontend URL

## Database
The quotations will be stored in the `quotations` collection in MongoDB.
