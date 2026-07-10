import Badge from "../Badge";

export default function StatusBadge({ status }) {

  let variant = "neutral";
  let text = status;

  switch (status) {
    case "Approved":
      variant = "success";
      text = "Approved";
      break;

    case "Pending":
      variant = "warning";
      text = "Pending Approval";
      break;

    case "Rejected":
      variant = "danger";
      text = "Rejected";
      break;

    default:
      variant = "neutral";
  }

  return (
    <Badge
      variant={variant}
      className="
        inline-flex
        w-fit
        px-3
        py-1
        text-xs
        font-semibold
        rounded-full
        whitespace-nowrap
      "
    >
      {text}
    </Badge>
  );
}