import { useGetUpcomingSoonBookings, getGetUpcomingSoonBookingsQueryKey } from "@workspace/api-client-react";
import type { Booking } from "@workspace/api-client-react";
import { useState } from "react";

export function useBookingAlerts() {
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const { data: upcoming } = useGetUpcomingSoonBookings({
    query: { queryKey: getGetUpcomingSoonBookingsQueryKey(), refetchInterval: 60_000 },
  });

  const alerts: Booking[] = (upcoming ?? []).filter((b) => !dismissedIds.has(b.id));

  const dismiss = (id: number) =>
    setDismissedIds((prev) => new Set([...prev, id]));

  return { alerts, dismiss };
}
