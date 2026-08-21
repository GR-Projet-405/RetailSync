import Badge from "../Badge";

export default function StatusBadge({ status }) {
  let variant = "neutral";
  let text = status;

  switch (status) {
    case "APPROVED":
      variant = "success";
      text = "Approved";
      break;

    case "PENDING":
      variant = "warning";
      text = "Pending Approval";
      break;

    case "REJECTED":
      variant = "danger";
      text = "Rejected";
      break;

    case "CONVERTED_TO_PO":
      variant = "info";
      text = "Converted to PO";
      break;

    default:
      variant = "neutral";
      text = status;
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