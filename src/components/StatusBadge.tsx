import type { SystemStatus } from "../types";

interface StatusBadgeProps {
	status: SystemStatus;
	size?: "sm" | "md";
}

const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
	// Configuration for different status types
	const statusConfig = {
		Operational: {
			bgColor: "bg-green-100",
			textColor: "text-green-800",
			borderColor: "border-green-200",
		},
		Warning: {
			bgColor: "bg-yellow-100",
			textColor: "text-yellow-800",
			borderColor: "border-yellow-200",
		},
		Critical: {
			bgColor: "bg-red-100",
			textColor: "text-red-800",
			borderColor: "border-red-200",
		},
	} as const;

	// Size configurations
	const sizeConfig = {
		sm: "px-2 py-0.5 text-xs",
		md: "px-2 py-1 text-xs",
	} as const;

	const config = statusConfig[status];
	const sizeClass = sizeConfig[size];

	return (
		<span
			className={`
        ${sizeClass}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        border
        rounded-full
        font-medium
        inline-flex
        items-center
      `
				.replace(/\s+/g, " ")
				.trim()}
			data-testid="status-badge"
			data-status={status.toLowerCase()}
			data-size={size}
		>
			{status}
		</span>
	);
};

export default StatusBadge;
