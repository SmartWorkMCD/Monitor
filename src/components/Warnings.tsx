import { AlertTriangle, X, Filter, Calendar, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import type { Warning, WarningSeverity } from "../types";

interface WarningsProps {
	warnings: Warning[];
}

interface AlertsModalProps {
	warnings: Warning[];
	isOpen: boolean;
	onClose: () => void;
}

const AlertsModal = ({ warnings, isOpen, onClose }: AlertsModalProps) => {
	const [selectedSeverity, setSelectedSeverity] = useState<WarningSeverity | 'all'>('all');
	const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');

	if (!isOpen) return null;

	// Filter and sort warnings
	const filteredWarnings = warnings
		.filter(warning => selectedSeverity === 'all' || warning.severity === selectedSeverity)
		.sort((a, b) => {
			if (sortBy === 'timestamp') {
				return b.timestamp - a.timestamp; // Most recent first
			} else {
				const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
				return severityOrder[b.severity] - severityOrder[a.severity];
			}
		});

	const getSeverityStats = () => {
		const stats = warnings.reduce((acc, warning) => {
			acc[warning.severity] = (acc[warning.severity] || 0) + 1;
			return acc;
		}, {} as Record<WarningSeverity, number>);

		return {
			high: stats.high || 0,
			medium: stats.medium || 0,
			low: stats.low || 0,
			total: warnings.length
		};
	};

	const stats = getSeverityStats();

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div>
						<h2 className="text-xl font-bold text-gray-800">All System Alerts</h2>
						<p className="text-sm text-gray-600 mt-1">
							{stats.total} total alerts • {stats.high} high • {stats.medium} medium • {stats.low} low
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						type="button"
					>
						<X size={20} />
					</button>
				</div>

				{/* Filters */}
				<div className="flex items-center space-x-4 p-6 border-b border-gray-100">
					<div className="flex items-center space-x-2">
						<Filter size={16} className="text-gray-500" />
						<span className="text-sm font-medium text-gray-700">Filter:</span>
						<select
							value={selectedSeverity}
							onChange={(e) => setSelectedSeverity(e.target.value as WarningSeverity | 'all')}
							className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All Severities</option>
							<option value="high">High Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="low">Low Priority</option>
						</select>
					</div>

					<div className="flex items-center space-x-2">
						<Calendar size={16} className="text-gray-500" />
						<span className="text-sm font-medium text-gray-700">Sort by:</span>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'severity')}
							className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="timestamp">Most Recent</option>
							<option value="severity">Severity</option>
						</select>
					</div>
				</div>

				{/* Alerts List */}
				<div className="flex-1 overflow-y-auto p-6">
					{filteredWarnings.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
							<p>No alerts match your current filters</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredWarnings.map((warning) => {
								const severityConfig = getSeverityConfig(warning.severity);
								return (
									<div
										key={warning.id}
										className={`p-4 rounded-lg border-l-4 ${severityConfig.borderClass} ${severityConfig.bgClass} hover:shadow-md transition-shadow`}
									>
										<div className="flex items-start justify-between">
											<div className="flex items-start space-x-3">
												<div className={`mt-0.5 ${severityConfig.iconClass}`}>
													<AlertTriangle size={18} />
												</div>
												<div className="flex-1">
													<div className="font-medium text-gray-800">
														{warning.message}
													</div>
													{warning.details && (
														<div className="text-sm text-gray-600 mt-1">
															{warning.details}
														</div>
													)}
													{warning.rule_id && (
														<div className="text-xs text-gray-500 mt-1">
															Rule ID: {warning.rule_id}
														</div>
													)}
												</div>
											</div>
											<div className="text-right">
												<div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
													warning.severity === 'high' ? 'bg-red-100 text-red-800' :
													warning.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
													'bg-blue-100 text-blue-800'
												}`}>
													{warning.severity.toUpperCase()}
												</div>
												<div className="text-xs text-gray-500 mt-1">
													{dayjs(warning.timestamp).format('MMM D, YYYY h:mm A')}
												</div>
												<div className="text-xs text-gray-400">
													{dayjs(warning.timestamp).fromNow()}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
					<div className="text-sm text-gray-600">
						Showing {filteredWarnings.length} of {warnings.length} alerts
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => {
								// Export functionality could be added here
								console.log('Export alerts', filteredWarnings);
							}}
							className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
							type="button"
						>
							Export
						</button>
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
							type="button"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const getSeverityConfig = (severity: WarningSeverity) => {
	const configs = {
		high: {
			borderClass: "border-red-500",
			bgClass: "bg-red-50",
			iconClass: "text-red-500",
		},
		medium: {
			borderClass: "border-yellow-500",
			bgClass: "bg-yellow-50",
			iconClass: "text-yellow-500",
		},
		low: {
			borderClass: "border-blue-500",
			bgClass: "bg-blue-50",
			iconClass: "text-blue-500",
		},
	} as const;

	return configs[severity];
};

const Warnings = ({ warnings }: WarningsProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<div
				className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full"
				data-testid="warnings-container"
			>
				<h2
					className="text-lg font-bold mb-4 text-gray-700"
					data-testid="warnings-title"
				>
					Warning Journal
				</h2>

				{/* Warnings list with scroll */}
				<div
					className="overflow-y-auto text-left"
					data-testid="warnings-list"
				>
					{warnings.length === 0 ? (
						<div
							className="text-center text-gray-500 py-8"
							data-testid="warnings-empty-state"
						>
							No warnings to display
						</div>
					) : (
						warnings.slice(0, 5).map((warning) => {
							const severityConfig = getSeverityConfig(warning.severity);

							return (
								<div
									key={warning.id}
									className={`mb-3 p-3 rounded-lg border-l-4 ${severityConfig.borderClass} ${severityConfig.bgClass}`}
									data-testid="warning-item"
									data-warning-id={warning.id}
									data-warning-severity={warning.severity}
								>
									<div className="flex items-start" data-testid="warning-content">
										<div
											data-testid="warning-icon"
											className={`mr-2 mt-0.5 ${severityConfig.iconClass}`}
										>
											<AlertTriangle size={18} />
										</div>
										<div>
											<div
												className="font-medium text-gray-800"
												data-testid="warning-message"
											>
												{warning.message}
											</div>
											<div
												className="text-xs text-gray-500 mt-1 text-left"
												data-testid="warning-timestamp"
											>
												{dayjs(warning.timestamp).calendar()}
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>

				{/* Footer action button */}
				<div
					className="mt-auto pt-4 border-t border-gray-100"
					data-testid="warnings-footer"
				>
					<button
						className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
						data-testid="view-all-alerts-button"
						onClick={() => setIsModalOpen(true)}
						type="button"
					>
						View All Alerts ({warnings.length})
					</button>
				</div>
			</div>

			<AlertsModal
				warnings={warnings}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</>
	);
};

export default Warnings;
