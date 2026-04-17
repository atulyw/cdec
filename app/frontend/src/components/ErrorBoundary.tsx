import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
          <div className="container-page flex min-h-screen items-center justify-center py-12">
            <Card className="w-full max-w-lg">
              <CardContent className="p-8">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Something went wrong
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  We encountered an unexpected error. Try again, or reload the page.
                </p>

                {import.meta.env.DEV && this.state.error ? (
                  <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Error details
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Stack trace
                        </summary>
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button onClick={this.handleRetry} className="w-full">
                    Try again
                  </Button>
                  <Button onClick={this.handleReload} variant="secondary" className="w-full">
                    Reload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
