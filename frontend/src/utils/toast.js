/**
 * Lightweight toast notification utility for RetailSync.
 * Uses a singleton DOM element — no external library needed.
 */

let toastContainer = null;

const getContainer = () => {
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;

  toastContainer = document.createElement('div');
  toastContainer.id = 'rs-toast-container';
  Object.assign(toastContainer.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '360px',
    width: '100%',
    pointerEvents: 'none',
  });
  document.body.appendChild(toastContainer);
  return toastContainer;
};

const ICONS = {
  success: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  error:   `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warning: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info:    `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
};

const STYLES = {
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', text: '#166534' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#991B1B' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', text: '#92400E' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: '#2563EB', text: '#1E40AF' },
};

const showToast = (message, type = 'info', duration = 4000) => {
  const container = getContainer();
  const style = STYLES[type];

  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  Object.assign(el.style, {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    background: style.bg,
    border: `1px solid ${style.border}`,
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    pointerEvents: 'all',
    opacity: '0',
    transform: 'translateX(20px)',
    transition: 'opacity 200ms ease, transform 200ms ease',
    cursor: 'pointer',
  });

  el.innerHTML = `
    <span style="color:${style.icon};margin-top:1px;flex-shrink:0;">${ICONS[type]}</span>
    <span style="font-size:13px;font-weight:500;color:${style.text};line-height:1.4;flex:1;">${message}</span>
    <button style="color:${style.icon};opacity:0.6;background:none;border:none;cursor:pointer;padding:0;font-size:16px;line-height:1;flex-shrink:0;" aria-label="Dismiss">×</button>
  `;

  const dismiss = () => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 200);
  };

  el.querySelector('button').addEventListener('click', dismiss);
  el.addEventListener('click', dismiss);

  container.appendChild(el);

  // Trigger animation
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
  });

  if (duration > 0) setTimeout(dismiss, duration);

  return dismiss;
};

export const toast = {
  success: (msg, duration) => showToast(msg, 'success', duration),
  error:   (msg, duration) => showToast(msg, 'error',   duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
  info:    (msg, duration) => showToast(msg, 'info',    duration),
};

export default toast;
