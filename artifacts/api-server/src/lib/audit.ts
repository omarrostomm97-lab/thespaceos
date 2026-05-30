import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { AuthUser } from "./auth";

export async function writeAuditLog(opts: {
  user?: AuthUser;
  tenantId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.insert(auditLogsTable).values({
      tenantId: opts.tenantId ?? opts.user?.tenantId ?? null,
      userId: opts.user?.id ?? null,
      action: opts.action,
      entityType: opts.entityType,
      entityId: opts.entityId ?? null,
      oldValue: opts.oldValue != null ? JSON.stringify(opts.oldValue) : null,
      newValue: opts.newValue != null ? JSON.stringify(opts.newValue) : null,
      ipAddress: opts.ipAddress ?? null,
    });
  } catch (err) {
    console.error("Audit log write failed", err);
  }
}
