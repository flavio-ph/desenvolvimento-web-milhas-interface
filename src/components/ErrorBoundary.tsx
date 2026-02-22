import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

/**
 * ErrorBoundary global — captura erros de renderização em qualquer filho
 * e exibe uma tela amigável ao invés de uma tela branca.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8 text-center">
                    <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center mb-6">
                        <AlertTriangle className="text-rose-500" size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Algo deu errado
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-2 max-w-md">
                        Ocorreu um erro inesperado na aplicação.
                    </p>
                    {this.state.error && (
                        <p className="text-xs text-slate-400 font-mono mb-8 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl max-w-md truncate">
                            {this.state.error.message}
                        </p>
                    )}
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <RefreshCw size={18} />
                        Voltar ao início
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
