'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    private reset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError && this.state.error) {
            return (
                this.props.fallback?.(this.state.error, this.reset) || (
                    <div className="border-2 border-red-600 bg-red-50 p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h2 className="font-bold text-red-900 mb-2">Algo deu errado</h2>
                                <p className="text-red-700 mb-4">{this.state.error.message}</p>
                                <button
                                    onClick={this.reset}
                                    className="border-2 border-red-600 bg-red-600 text-white font-bold px-4 py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

/**
 * HOC para envolver components com error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: (error: Error, reset: () => void) => ReactNode
) {
    return function ErrorBoundaryComponent(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

/**
 * Error boundary específica para páginas
 */
export function PageErrorFallback(error: Error, reset: () => void) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="border-2 border-red-600 bg-red-50 p-8 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <h1 className="font-black text-2xl text-red-900">Erro na Página</h1>
                </div>
                <p className="text-red-700 mb-4 text-sm">{error.message}</p>
                <div className="flex gap-2">
                    <button
                        onClick={reset}
                        className="flex-1 border-2 border-red-600 bg-red-600 text-white font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                    >
                        Recarregar
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 border-2 border-red-600 font-bold py-2 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
                    >
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}
