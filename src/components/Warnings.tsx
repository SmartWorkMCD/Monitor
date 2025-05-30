import { AlertTriangle } from "lucide-react";
import dayjs from "dayjs";
import type { Warning, WarningSeverity } from "../types";

interface WarningsProps {
	warnings: Warning[];
}

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
	return (
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
					warnings.map((warning) => {
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
					onClick={() => {
						// TODO: Implement view all alerts functionality
						console.warn("View all alerts clicked");
					}}
					type="button"
				>
					View All Alerts
				</button>
			</div>
		</div>
	);
};

export default Warnings;
