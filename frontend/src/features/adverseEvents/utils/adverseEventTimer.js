export const getAdverseEventTimerState = (event, report, now) => {
  if (report) {
    // Map internal ae_reports.status values to coordinator-facing display labels.
    // "approved" means the EC has reviewed and accepted — show as "Reported" to coordinators.
    // "pending" was the original status before 'submitted' was added; treat it as submitted.
    let statusLabel;
    if (report.status === "approved") {
      statusLabel = "Reported";
    } else if (report.status === "pending" || report.status === "submitted") {
      statusLabel = "Submitted";
    } else {
      statusLabel = report.status; // "rejected" stays as-is
    }

    return {
      timerLabel: "Timer stopped",
      statusLabel,
    };
  }

  if (!event?.regulatory_deadline) {
    return {
      timerLabel: "No deadline recorded",
      statusLabel: event?.status || "Open",
    };
  }

  if (!now) {
    return {
      timerLabel: "Calculating...",
      statusLabel: event.status,
    };
  }

  const difference = new Date(event.regulatory_deadline).getTime() - now;

  if (difference < 0) {
    return {
      timerLabel: "Overdue",
      statusLabel: "Overdue",
    };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return {
    timerLabel: `${days}d ${remainingHours}h remaining`,
    statusLabel: event.status,
  };
};
