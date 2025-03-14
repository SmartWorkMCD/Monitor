const StatusBadge = ({ status }: { status: 'Operational' | 'Warning' | 'Critical' }) => {
  const colors = {
    Operational: "bg-green-100 text-green-800",
    Warning: "bg-yellow-100 text-yellow-800",
    Critical: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
