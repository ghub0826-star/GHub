import React from 'react';

/**
 * Error boundary. Shows a friendly message instead of a white screen.
 * Does NOT expose stack traces in production.
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Report to error monitoring (no secrets sent)
    if (process.env.NODE_ENV === 'production') {
      try {
        // eslint-disable-next-line no-console
        console.error('AppErrorBoundary captured:', error);
      } catch {
        /* ignore */
      }
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h2>Terjadi kesalahan saat membuka halaman</h2>
            <p style={{ color: 'var(--muted)' }}>
              Silakan coba lagi atau kembali ke halaman utama.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <button className="button" onClick={this.handleRetry}>
                Coba Lagi
              </button>
              <a href="/" className="button" style={{ background: 'transparent' }}>
                Kembali ke Homepage
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
