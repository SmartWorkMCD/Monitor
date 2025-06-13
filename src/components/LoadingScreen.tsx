// src/components/LoadingScreen.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { Activity, Wifi, Database, MessageSquare } from 'lucide-react';

interface LoadingScreenProps {
	message?: string;
	timeout?: number; // in milliseconds
	onTimeout?: () => void;
}

interface LoadingStep {
	id: string;
	label: string;
	icon: React.ReactNode;
	status: 'pending' | 'loading' | 'completed' | 'error';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
	message = "Loading...",
	timeout = 30000,
	onTimeout
}) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [steps, setSteps] = useState<LoadingStep[]>([
		{
			id: 'init',
			label: 'Initializing application',
			icon: <Activity size={16} />,
			status: 'loading'
		},
		{
			id: 'api',
			label: 'Connecting to Aggregator API',
			icon: <Database size={16} />,
			status: 'pending'
		},
		{
			id: 'websocket',
			label: 'Establishing WebSocket connection',
			icon: <Wifi size={16} />,
			status: 'pending'
		},
		{
			id: 'mqtt',
			label: 'Subscribing to MQTT topics',
			icon: <MessageSquare size={16} />,
			status: 'pending'
		}
	]);

	// Simulate loading progress
	useEffect(() => {
		const interval = setInterval(() => {
			setSteps(prevSteps => {
				const newSteps = [...prevSteps];
				const currentStepIndex = newSteps.findIndex(step => step.status === 'loading');

				if (currentStepIndex !== -1) {
					// Complete current step
					newSteps[currentStepIndex].status = 'completed';

					// Start next step if available
					if (currentStepIndex + 1 < newSteps.length) {
						newSteps[currentStepIndex + 1].status = 'loading';
						setCurrentStep(currentStepIndex + 1);
					}
				}

				return newSteps;
			});
		}, 1500); // Each step takes 1.5 seconds

		return () => clearInterval(interval);
	}, []);

	// Timeout handler
	useEffect(() => {
		const timeoutTimer = setTimeout(() => {
			if (onTimeout) {
				onTimeout();
			}
		}, timeout);

		return () => clearTimeout(timeoutTimer);
	}, [timeout, onTimeout]);

	const getStatusIcon = (status: LoadingStep['status']) => {
		switch (status) {
			case 'loading':
				return (
					<div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
				);
			case 'completed':
				return (
					<div className="rounded-full h-4 w-4 bg-green-500 flex items-center justify-center">
						<svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
						</svg>
					</div>
				);
			case 'error':
				return (
					<div className="rounded-full h-4 w-4 bg-red-500 flex items-center justify-center">
						<svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
						</svg>
					</div>
				);
			default:
				return (
					<div className="rounded-full h-4 w-4 border-2 border-gray-300" />
				);
		}
	};

	const completedSteps = steps.filter(step => step.status === 'completed').length;
	const progressPercentage = (completedSteps / steps.length) * 100;

	return (
		<div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<Activity size={32} className="text-white animate-pulse" />
					</div>
					<h1 className="text-xl font-bold text-gray-800 mb-2">
						Production Line Monitor
					</h1>
					<p className="text-gray-600">
						{message}
					</p>
				</div>

				{/* Progress Bar */}
				<div className="mb-6">
					<div className="flex justify-between text-sm text-gray-600 mb-2">
						<span>Loading...</span>
						<span>{Math.round(progressPercentage)}%</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
							style={{ width: `${progressPercentage}%` }}
						/>
					</div>
				</div>

				{/* Loading Steps */}
				<div className="space-y-3">
					{steps.map((step, index) => (
						<div
							key={step.id}
							className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
								step.status === 'loading'
									? 'bg-blue-50 border-2 border-blue-200'
									: step.status === 'completed'
									? 'bg-green-50'
									: step.status === 'error'
									? 'bg-red-50'
									: 'bg-gray-50'
							}`}
						>
							<div className="flex-shrink-0">
								{getStatusIcon(step.status)}
							</div>
							<div className="flex items-center gap-2 flex-1">
								<div className={`${
									step.status === 'loading' ? 'text-blue-600' :
									step.status === 'completed' ? 'text-green-600' :
									step.status === 'error' ? 'text-red-600' :
									'text-gray-500'
								}`}>
									{step.icon}
								</div>
								<span className={`text-sm font-medium ${
									step.status === 'loading' ? 'text-blue-800' :
									step.status === 'completed' ? 'text-green-800' :
									step.status === 'error' ? 'text-red-800' :
									'text-gray-600'
								}`}>
									{step.label}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						This may take a few moments while we establish connections...
					</p>
				</div>

				{/* Pulsing dots animation */}
				<div className="flex justify-center mt-4 space-x-1">
					<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
					<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
					<div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
				</div>
			</div>
		</div>
	);
};

export default LoadingScreen;
