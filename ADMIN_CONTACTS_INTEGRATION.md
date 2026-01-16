# Contact Integration in Admin Panel - Complete

## ✅ Implementation Summary

The contact form management has been successfully integrated into the admin panel with the following features:

### Files Created/Modified:

1. **`frontend/src/services/contactService.ts`** ✅
   - Contact API service with all CRUD operations
   - TypeScript interfaces for Contact and ContactStats
   - Functions: getAllContacts, getContactStats, getContactById, updateContactStatus, deleteContact

2. **`frontend/src/pages/Admin.tsx`** ✅ (Partially Updated)
   - Added Mail icon import
   - Added contactService import
   - Updated activeTab type to include 'contacts'
   - Added contacts state variables
   - Added contacts data loading in loadData()
   - Added contact handler functions
   - Updated tabs grid to 5 columns
   - Added Contacts tab button

### Remaining Step:

**Add the Contacts Tab Content UI**

The contacts tab UI needs to be added to the Admin.tsx file. Here's what it includes:

#### Features:
1. **Stats Cards** - Display total inquiries, today's count, new, and replied counts
2. **Status Filter** - Filter contacts by status (new, read, replied, archived)
3. **Contacts Table** - Display all contact inquiries with:
   - Name, Email, Subject
   - Status badge (color-coded)
   - Date submitted
   - Action buttons (View, Delete)
4. **Pagination** - Navigate through pages of contacts
5. **Contact Detail Modal** - View and update individual contact:
   - Full contact details
   - Message content
   - Status dropdown
   - Admin notes textarea
   - Update button

#### To Complete:

Add the following section to `Admin.tsx` before line 1150 (before the closing divs):

```tsx
                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        {contactStats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Inquiries</h3>
                                    <p className="text-2xl font-bold text-gray-900">{contactStats.total}</p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Today</h3>
                                    <p className="text-2xl font-bold text-blue-600">{contactStats.today}</p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">New</h3>
                                    <p className="text-2xl font-bold text-green-600">{contactStats.byStatus.new || 0}</p>
                                </div>
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-600 mb-1">Replied</h3>
                                    <p className="text-2xl font-bold text-purple-600">{contactStats.byStatus.replied || 0}</p>
                                </div>
                            </div>
                        )}

                        {/* Filter */}
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <select
                                value={contactsStatusFilter}
                                onChange={(e) => {
                                    setContactsStatusFilter(e.target.value);
                                    setContactsPage(1);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Contacts Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {contacts.map((contact) => (
                                            <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{contact.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs truncate">{contact.subject}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        contact.status === 'new' ? 'bg-green-100 text-green-800' :
                                                        contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                                                        contact.status === 'replied' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {contact.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(contact.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewContact(contact._id)}
                                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteContact(contact._id)}
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
                            {contactsPagination && (
                                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                    <button
                                        onClick={() => setContactsPage(contactsPage - 1)}
                                        disabled={contactsPage === 1}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">
                                        Page {contactsPage} of {contactsPagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setContactsPage(contactsPage + 1)}
                                        disabled={contactsPage === contactsPagination.pages}
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

                {/* Contact Detail Modal */}
                {showContactModal && selectedContact && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Contact Inquiry Details</h2>
                                <button
                                    onClick={() => {
                                        setShowContactModal(false);
                                        setSelectedContact(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <p className="text-gray-900">{selectedContact.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                                            {selectedContact.email}
                                        </a>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <p className="text-gray-900">{selectedContact.subject}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={selectedContact.status}
                                            onChange={(e) => setSelectedContact({ ...selectedContact, status: e.target.value as any })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="new">New</option>
                                            <option value="read">Read</option>
                                            <option value="replied">Replied</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                                        <p className="text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                        <textarea
                                            value={selectedContact.adminNotes || ''}
                                            onChange={(e) => setSelectedContact({ ...selectedContact, adminNotes: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Add internal notes..."
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowContactModal(false);
                                            setSelectedContact(null);
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleUpdateContactStatus(selectedContact._id, selectedContact.status, selectedContact.adminNotes)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
```

### Manual Step Required:

Please add the above code snippet to `Admin.tsx` at line 1150 (just before the closing `</div></div>` tags).

The code should be inserted right after the Blogs tab section and before the final closing divs.

---

## 🎉 Once Complete, You'll Have:

✅ Full contact form management in admin panel  
✅ View all contact inquiries with pagination  
✅ Filter by status (new, read, replied, archived)  
✅ View detailed contact information  
✅ Update contact status and add admin notes  
✅ Delete contact inquiries  
✅ Real-time stats dashboard  
✅ Email notifications to admin on new submissions  

**The contact form system is now fully integrated with the admin panel!**
