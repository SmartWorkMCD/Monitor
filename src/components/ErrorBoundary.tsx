// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
		errorId: ''
	};

	public static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
			errorInfo: null,
			errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);

		this.setState({
			error,
			errorInfo,
			errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
		});

		// You can also log the error to an error reporting service here
		// Example: logErrorToService(error, errorInfo);
	}

	private handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
			errorId: ''
		});
	};

	private handleReload = () => {
		window.location.reload();
	};

	private copyErrorToClipboard = async () => {
		const errorDetails = {
			id: this.state.errorId,
			message: this.state.error?.message,
			stack: this.state.error?.stack,
			componentStack: this.state.errorInfo?.componentStack,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href
		};

		try {
			await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
			alert('Error details copied to clipboard');
		} catch (err) {
			console.error('Failed to copy error details:', err);
		}
	};

	public render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const isDevelopment = true; //process.env.NODE_ENV === 'development';

			return (
				<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
						{/* Header */}
						<div className="text-center mb-6">
							<div className="text-red-600 mb-4">
								<AlertTriangle size={64} className="mx-auto" />
							</div>
							<h1 className="text-2xl font-bold text-gray-800 mb-2">
								Something went wrong
							</h1>
							<p className="text-gray-600">
								The Monitor application encountered an unexpected error.
							</p>
						</div>

						{/* Error Details */}
						<div className="bg-gray-50 rounded-lg p-4 mb-6">
							<div className="flex items-center gap-2 mb-2">
								<Bug size={16} className="text-gray-600" />
								<span className="font-medium text-gray-700">Error Details</span>
							</div>
							<div className="text-sm font-mono text-gray-800 mb-2">
								{this.state.error?.message || 'Unknown error occurred'}
							</div>
							<div className="text-xs text-gray-500">
								Error ID: {this.state.errorId}
							</div>
						</div>

						{/* Development Details */}
						{isDevelopment && this.state.error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
								<h3 className="font-semibold text-red-800 mb-2">
									Development Information
								</h3>
								<pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
									{this.state.error.stack}
								</pre>
								{this.state.errorInfo && (
									<details className="mt-4">
										<summary className="cursor-pointer text-red-800 font-medium">
											Component Stack
										</summary>
										<pre className="text-xs text-red-700 mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
											{this.state.errorInfo.componentStack}
										</pre>
									</details>
								)}
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 justify-center">
							<button
								onClick={this.handleRetry}
								className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                type="button"
							>
								<RefreshCw size={16} />
								Try Again
							</button>

							<button
								onClick={this.handleReload}
								className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                type="button"
							>
								Reload Page
							</button>

							{isDevelopment && (
								<button
									onClick={this.copyErrorToClipboard}
									className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    type="button"
								>
									Copy Error Details
								</button>
							)}
						</div>

						{/* Help Text */}
						<div className="mt-6 text-center text-sm text-gray-500">
							<p>
								If this problem persists, please check:
							</p>
							<ul className="mt-2 text-left inline-block">
								<li>• Network connection is stable</li>
								<li>• Aggregator API is running (port 8000)</li>
								<li>• MQTT WebSocket bridge is running (port 8080)</li>
								<li>• Browser console for additional errors</li>
							</ul>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
