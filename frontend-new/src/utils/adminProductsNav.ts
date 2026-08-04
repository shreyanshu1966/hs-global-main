// The app's react-router-dom import is a Next.js shim (src/shims/react-router-dom.tsx)
// whose useNavigate/useLocation drop `state` entirely (useLocation always returns
// state: null). Router state can't carry the products-list position across the
// products <-> product-edit navigation, so we stash it in a module-level variable
// instead — it survives Next's client-side route transitions since the JS module
// registry isn't reset between them.

export interface AdminProductsListState {
    page: number;
    search: string;
    category: string;
    subcategory: string;
    status: string;
    scrollY: number;
}

let pendingListState: AdminProductsListState | null = null;

export function saveAdminProductsListState(state: AdminProductsListState) {
    pendingListState = state;
}

// Consumes (clears) the saved state so a later, unrelated visit to /admin
// doesn't restore a stale position.
export function consumeAdminProductsListState(): AdminProductsListState | null {
    const state = pendingListState;
    pendingListState = null;
    return state;
}
