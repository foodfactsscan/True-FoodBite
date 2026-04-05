import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidUpdate(prevProps) {
        // If the location changed, reset the error state to let user try a different page
        if (this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
