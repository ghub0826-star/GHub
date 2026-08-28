// Client-side Midtrans Snap loader. Only uses the CLIENT KEY (safe for browser).
// Never import or use the Server Key here.

let snapPromise = null;
let snapInstance = null;

// CRA uses REACT_APP_* prefix. Fallback to VITE_* for forward-compatibility.
const isProduction = (process.env.REACT_APP_MIDTRANS_IS_PRODUCTION === 'true')
  || ((import.meta && import.meta.env) ? import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' : false);

const clientKey = process.env.REACT_APP_MIDTRANS_CLIENT_KEY
  || ((import.meta && import.meta.env) ? (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '') : '');

const SNAP_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const SNAP_PRODUCTION_URL = 'https://app.midtrans.com/snap/snap.js';

function getSnapUrl() {
  return isProduction ? SNAP_PRODUCTION_URL : SNAP_SANDBOX_URL;
}

// Load the Snap.js script once and return a promise of the Snap instance.
export function loadSnap() {
  if (snapInstance) return Promise.resolve(snapInstance);
  if (snapPromise) return snapPromise;

  if (!clientKey) {
    return Promise.reject(new Error('Midtrans client key not configured'));
  }

  snapPromise = new Promise((resolve, reject) => {
    // Remove any existing snap script to avoid duplicates
    const existing = document.getElementById('midtrans-snap-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = `${getSnapUrl()}?client_key=${encodeURIComponent(clientKey)}`;
    script.type = 'text/javascript';
    script.onload = () => {
      if (window.snap) {
        snapInstance = window.snap;
        resolve(snapInstance);
      } else {
        reject(new Error('Snap script loaded but window.snap is undefined'));
      }
    };
    script.onerror = () => {
      snapPromise = null;
      reject(new Error('Gagal memuat Midtrans Snap'));
    };
    document.body.appendChild(script);
  });

  return snapPromise;
}

// Open the Snap payment modal with the given token.
export function openSnap(snapToken, handlers = {}) {
  return loadSnap().then((snap) => {
    snap.pay(snapToken, {
      onSuccess: (result) => handlers.onSuccess && handlers.onSuccess(result),
      onPending: (result) => handlers.onPending && handlers.onPending(result),
      onError: (result) => handlers.onError && handlers.onError(result),
      onClose: () => handlers.onClose && handlers.onClose(),
    });
  });
}

// Close the Snap modal (no-op if not open).
export function closeSnap() {
  try {
    if (window.snap && typeof window.snap.hide === 'function') {
      window.snap.hide();
    }
  } catch (_) {
    // ignore
  }
}

export default { loadSnap, openSnap, closeSnap };
