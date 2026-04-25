import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import type { VerificationStatus } from "@/types";

interface VerificationStatusBadgeProps extends BadgeProps {
  status: VerificationStatus;
}

const statusConfig: Record<
  VerificationStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    className: string;
  }
> = {
  PASS: {
    label: "PASS",
    icon: Icons.pass,
    className: "bg-success text-success-foreground hover:bg-success/80",
  },
  FAIL: {
    label: "FAIL",
    icon: Icons.fail,
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  },
  MANUAL_REVIEW: {
    label: "MANUAL_REVIEW",
    icon: Icons.manualReview,
    className: "bg-warning text-warning-foreground hover:bg-warning/80",
  },
  PENDING: {
    label: "PENDING",
    icon: Icons.pending,
    className: "bg-pending text-pending-foreground hover:bg-pending/80",
  },
  APPROVED: {
    label: "APPROVED",
    icon: Icons.approved,
    className: "bg-info text-info-foreground hover:bg-info/80",
  },
  REJECTED: {
    label: "REJECTED",
    icon: Icons.rejected,
    className: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  },
};

export function VerificationStatusBadge({
  status,
  className,
  ...props
}: VerificationStatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return null;
  }

  const { label, icon: Icon, className: statusClassName } = config;

  return (
    <Badge
      className={cn("flex items-center gap-1.5", statusClassName, className)}
      {...props}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
}
