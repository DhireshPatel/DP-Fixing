const STATUS_CLASS_MAP = {
  Pending: "badge-pending",
  Confirmed: "badge-confirmed",
  Assigned: "badge-assigned",
  "In Progress": "badge-inprogress",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASS_MAP[status] || "badge-pending";
  return <span className={`badge ${cls}`}>{status}</span>;
}
