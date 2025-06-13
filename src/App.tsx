// src/App.tsx
import React, { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import dataService from "./services/dataService";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";

// Configure dayjs plugins once at app initialization
dayjs.extend(calendar);
dayjs.extend(relativeTime);

// Environment configuration
const isDevelopment = true;
const isDebugMode = true;

function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Initialize the application
		const initializeApp = async () => {
			try {
				if (isDebugMode) {
					console.log('🚀 Initializing Monitor App...');
				}

				// Test initial connections
				await Promise.race([
					// Try to fetch initial data with timeout
					new Promise(async (resolve, reject) => {
						try {
							await dataService.fetchAggregatorMetrics();
							resolve(true);
						} catch (error) {
							// Don't reject on API errors - the app should still work with mock data
							console.warn('Aggregator API not available, continuing with cached data');
							resolve(true);
						}
					}),
					// Timeout after 5 seconds
					new Promise((_, reject) =>
						setTimeout(() => reject(new Error('Initialization timeout')), 5000)
					)
				]);

				if (isDebugMode) {
					console.log('✅ App initialization completed');
				}

				setIsLoading(false);
			} catch (error) {
				console.error('Failed to initialize app:', error);
				setError(error instanceof Error ? error.message : 'Failed to initialize application');
				setIsLoading(false);
			}
		};

		initializeApp();

		// Cleanup function
		return () => {
			if (isDebugMode) {
				console.log('🧹 Cleaning up App...');
			}
			dataService.disconnect();
		};
	}, [isDebugMode]);

	// Error recovery handler
	const handleErrorRecovery = () => {
		setError(null);
		setIsLoading(true);
		// Reload the page to restart the app
		window.location.reload();
	};

	// Global error handler
	useEffect(() => {
		const handleGlobalError = (event: ErrorEvent) => {
			console.error('Global error:', event.error);
			if (!isDevelopment) {
				setError('An unexpected error occurred. Please refresh the page.');
			}
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			console.error('Unhandled promise rejection:', event.reason);
			if (!isDevelopment) {
				setError('A network error occurred. Please check your connection.');
			}
		};

		window.addEventListener('error', handleGlobalError);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleGlobalError);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	}, [isDevelopment]);

	// Performance monitoring
	useEffect(() => {
		if (isDebugMode && 'performance' in window) {
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry) => {
					if (entry.entryType === 'navigation') {
						console.log('📊 Navigation timing:', {
							domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
							loadComplete: entry.loadEventEnd - entry.loadEventStart,
							total: entry.loadEventEnd - entry.fetchStart
						});
					}
				});
			});

			observer.observe({ entryTypes: ['navigation'] });

			return () => observer.disconnect();
		}
	}, [isDebugMode]);

	if (isLoading) {
		return <LoadingScreen message="Initializing Production Line Monitor..." />;
	}

	if (error) {
		return (
			<div className="h-screen bg-gray-100 flex items-center justify-center">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
					<div className="text-center">
						<div className="text-red-600 mb-4">
							<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
							</svg>
						</div>
						<h2 className="text-xl font-bold text-gray-800 mb-2">
							Application Error
						</h2>
						<p className="text-gray-600 mb-6">
							{error}
						</p>
						<button
							onClick={handleErrorRecovery}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className="App">
				<Dashboard />
			</div>
		</ErrorBoundary>
	);
}

export default App;
