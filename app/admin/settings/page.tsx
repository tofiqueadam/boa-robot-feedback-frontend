"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { Toggle } from "@/components/ui/Toggle";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { usePermissions } from "@/lib/PermissionsContext";
import type { AppSettings, AuditLogEntry } from "@/types";
import { formatDate } from "@/lib/utils";

const PERM_ROWS: { key: keyof AppSettings; label: string; desc: string }[] = [
  { key: "perm_view_responses",        label: "View responses & summary",       desc: "Access the Responses section and Summary tab" },
  { key: "perm_export_responses",      label: "Export responses",               desc: "Download CSV and Excel exports" },
  { key: "perm_delete_responses",      label: "Delete individual responses",    desc: "Permanently delete a single response from Individual Responses" },
  { key: "perm_view_questions",        label: "View questions",                 desc: "See all questions and categories" },
  { key: "perm_add_edit_questions",    label: "Add & edit questions",           desc: "Create new questions and edit existing ones" },
  { key: "perm_retire_questions",      label: "Retire questions",               desc: "Remove questions from future forms" },
  { key: "perm_reorder_questions",     label: "Reorder questions & categories", desc: "Drag to reorder questions and categories" },
  { key: "perm_manage_categories",     label: "Manage categories",              desc: "Create and rename question categories" },
  { key: "perm_change_settings",       label: "Change settings",                desc: "Modify application settings" },
  { key: "perm_view_audit_log",        label: "View audit log",                 desc: "See admin activity history" },
  { key: "perm_view_robots_locations", label: "View robots & locations",        desc: "Access robot and branch filter lists" },
];

export default function SettingsPage() {
  const { isSuperAdmin, canChangeSettings, canViewAuditLog } = usePermissions();
  // Use saveSignal — avoids re-rendering the whole admin shell on every save
  const triggerSaveState = (s: "idle" | "saving" | "saved" | "error") => {
    import("@/lib/saveSignal").then(({ saveSignal }) => saveSignal.emit(s));
  };

  const [settings, setSettings]       = useState<AppSettings | null>(null);
  const [loading, setLoading]         = useState(true);
  const [errorMsg, setErrorMsg]       = useState("");
  const [auditLogs, setAuditLogs]     = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal]   = useState(0);
  const [auditPage, setAuditPage]     = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try { setSettings(await api.getSettings()); }
    catch (e: any) { setErrorMsg(e.message); }
    finally { setLoading(false); }
  }, []);

  const loadAudit = useCallback(async (page: number) => {
    if (!canViewAuditLog) return;
    setAuditLoading(true);
    try {
      const data = await api.getAuditLogs(page);
      setAuditLogs(data.items); setAuditTotal(data.total);
    } catch {}
    finally { setAuditLoading(false); }
  }, [canViewAuditLog]);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { if (canViewAuditLog) loadAudit(1); }, [loadAudit, canViewAuditLog]);

  const triggerSave = useCallback((updated: AppSettings) => {
    if (!canChangeSettings) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    triggerSaveState("saving");
    debounceRef.current = setTimeout(async () => {
      try {
        const saved = await api.updateSettings({
          form_name: updated.form_name,
          form_description: updated.form_description,
          accept_responses: updated.accept_responses,
          allow_multiple_submissions: updated.allow_multiple_submissions,
          show_thank_you: updated.show_thank_you,
          thank_you_message: updated.thank_you_message,
          rating_scale: updated.rating_scale,
          rating_display: updated.rating_display,
          needs_attention_threshold: updated.needs_attention_threshold,
          store_submission_timestamp: updated.store_submission_timestamp,
          audit_logging_enabled: updated.audit_logging_enabled,
          ...(isSuperAdmin ? {
            perm_view_responses:        updated.perm_view_responses,
            perm_export_responses:      updated.perm_export_responses,
            perm_delete_responses:      updated.perm_delete_responses,
            perm_view_questions:        updated.perm_view_questions,
            perm_add_edit_questions:    updated.perm_add_edit_questions,
            perm_retire_questions:      updated.perm_retire_questions,
            perm_reorder_questions:     updated.perm_reorder_questions,
            perm_manage_categories:     updated.perm_manage_categories,
            perm_change_settings:       updated.perm_change_settings,
            perm_view_audit_log:        updated.perm_view_audit_log,
            perm_view_robots_locations: updated.perm_view_robots_locations,
          } : {}),
        });
        setSettings(saved);
        triggerSaveState("saved");
        setTimeout(() => triggerSaveState("idle"), 2500);
      } catch (e: any) {
        setErrorMsg(e.message);
        triggerSaveState("error");
        setTimeout(() => triggerSaveState("idle"), 3000);
      }
    }, 500);
  }, [canChangeSettings, isSuperAdmin]);

  const update = (key: keyof AppSettings, value: unknown) => {
    setSettings((s) => {
      if (!s) return s;
      const updated = { ...s, [key]: value };
      triggerSave(updated);
      return updated;
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif font-semibold text-[22px] md:text-[26px] text-[#0D0D0D]">Settings</h1>
        <p className="text-[#888] text-[12px] md:text-[13px] mt-0.5">Configure feedback collection and admin permissions</p>
      </div>

      {errorMsg && <div className="mb-4"><ErrorBanner message={errorMsg} /></div>}

      {!canChangeSettings && (
        <div className="mb-5 flex items-center gap-2.5 bg-[#E8A020]/10 border border-[#E8A020]/20 rounded-[10px] px-4 py-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#B87C10] flex-shrink-0">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-[13px] text-[#B87C10] font-medium">Read-only. Contact the superadmin to make changes.</p>
        </div>
      )}

      {settings && (
        <div className="flex flex-col gap-4 max-w-full md:max-w-[720px]">

          <Panel title="General">
            <Field label="Form name" desc="Displayed at the top of the feedback form">
              <input type="text" value={settings.form_name}
                onChange={(e) => update("form_name", e.target.value)}
                disabled={!canChangeSettings}
                className="w-full border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020] disabled:opacity-50 transition-all" />
            </Field>
            <Field label="Description">
              <textarea value={settings.form_description}
                onChange={(e) => update("form_description", e.target.value)}
                disabled={!canChangeSettings} rows={2}
                className="w-full border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8A020] disabled:opacity-50 transition-all" />
            </Field>
          </Panel>

          <Panel title="Feedback Behavior">
            <Row label="Accept responses" desc="Turn off to pause new submissions"
              checked={settings.accept_responses} disabled={!canChangeSettings}
              onChange={(v) => update("accept_responses", v)} />
            <Row label="Allow multiple submissions" desc="Same session can submit more than once"
              checked={settings.allow_multiple_submissions} disabled={!canChangeSettings}
              onChange={(v) => update("allow_multiple_submissions", v)} />
            <Row label="Show thank-you screen" desc="Confirmation page after submit"
              checked={settings.show_thank_you} disabled={!canChangeSettings}
              onChange={(v) => update("show_thank_you", v)} />
            <Field label="Thank-you message">
              <textarea value={settings.thank_you_message}
                onChange={(e) => update("thank_you_message", e.target.value)}
                disabled={!canChangeSettings} rows={2}
                className="w-full border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8A020] disabled:opacity-50 transition-all" />
            </Field>
          </Panel>

          <Panel title="Rating">
            <Field label="Needs attention threshold" desc="Questions averaging below this are flagged with ⚠">
              <div className="flex items-center gap-3">
                <input type="number" step="0.1" min="1" max="5"
                  value={settings.needs_attention_threshold}
                  onChange={(e) => update("needs_attention_threshold", parseFloat(e.target.value))}
                  disabled={!canChangeSettings}
                  className="w-24 border border-[#E6E5E0] rounded-[9px] bg-[#F8F7F4] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020] disabled:opacity-50 transition-all" />
                <span className="text-sm text-[#888]">/ 5</span>
              </div>
            </Field>
          </Panel>

          {isSuperAdmin && (
            <Panel title="Admin Role Permissions">
              <p className="text-[12.5px] text-[#888] mb-4 leading-relaxed">
                Control what the <span className="font-semibold text-[#0D0D0D]">admin</span> account can access.
                Superadmin always has full access regardless of these settings.
              </p>
              {PERM_ROWS.map((r) => (
                <Row key={r.key} label={r.label} desc={r.desc}
                  checked={!!(settings[r.key] as boolean)}
                  onChange={(v) => update(r.key, v)} />
              ))}
            </Panel>
          )}

          <Panel title="Administration">
            <Row label="Audit logging" desc="Record admin actions with timestamps"
              checked={settings.audit_logging_enabled} disabled={!canChangeSettings}
              onChange={(v) => update("audit_logging_enabled", v)} />
          </Panel>

          {canViewAuditLog && (
            <Panel title="Audit Log">
              {auditLoading ? (
                <div className="py-4 flex justify-center">
                  <span className="w-5 h-5 border-2 border-[#E6E5E0] border-t-[#E8A020] rounded-full animate-spin" />
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-sm text-[#888] py-2">No audit entries yet.</p>
              ) : (
                <>
                  <div className="divide-y divide-[#F8F7F4]">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-2.5 flex items-start gap-3">
                        <span className="font-mono text-[10px] bg-[#E8A020]/10 text-[#B87C10] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5 whitespace-nowrap">
                          {log.action}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate">
                            {log.admin_email ?? "System"}
                            {log.entity_type && <span className="text-[#888] font-normal"> · {log.entity_type}</span>}
                          </div>
                          <div className="font-mono text-[11px] text-[#888] mt-0.5">{formatDate(log.created_at)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {auditTotal > 20 && (
                    <div className="flex items-center gap-3 pt-3 border-t border-[#F5F5F3] mt-2">
                      <button disabled={auditPage <= 1}
                        onClick={() => { const p = auditPage - 1; setAuditPage(p); loadAudit(p); }}
                        className="text-sm font-semibold text-[#888] hover:text-[#0D0D0D] disabled:opacity-30">← Prev</button>
                      <span className="font-mono text-[12px] text-[#888]">{auditPage} / {Math.ceil(auditTotal / 20)}</span>
                      <button disabled={auditPage >= Math.ceil(auditTotal / 20)}
                        onClick={() => { const p = auditPage + 1; setAuditPage(p); loadAudit(p); }}
                        className="text-sm font-semibold text-[#888] hover:text-[#0D0D0D] disabled:opacity-30">Next →</button>
                    </div>
                  )}
                </>
              )}
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E6E5E0] rounded-[14px] px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#E8A020] font-bold mb-4">{title}</h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Row({ label, desc, checked, onChange, disabled }: {
  label: string; desc?: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F8F7F4] last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-[#0D0D0D]">{label}</div>
        {desc && <div className="text-[12px] text-[#888] mt-0.5">{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={label} />
    </div>
  );
}

function Field({ label, desc, children }: {
  label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="py-3 border-b border-[#F8F7F4] last:border-b-0 last:pb-0 first:pt-0">
      <label className="block text-sm font-semibold text-[#0D0D0D] mb-1">{label}</label>
      {desc && <div className="text-[12px] text-[#888] mb-2">{desc}</div>}
      {children}
    </div>
  );
}
