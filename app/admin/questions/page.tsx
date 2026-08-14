"use client";
import { useEffect, useState, useCallback } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragOverEvent,
  DragOverlay, DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { QuestionModal } from "@/components/admin/questions/QuestionModal";
import { usePermissions } from "@/lib/PermissionsContext";
import type { Question, QuestionType } from "@/types";

const TYPE_LABELS: Record<QuestionType, string> = {
  rating:          "★ Rating",
  short_text:      "Short Text",
  paragraph:       "¶ Paragraph",
  multiple_choice: "Multiple Choice",
};

interface Section {
  id: string;
  title: string;
  display_order: number;
  active: boolean;
}

type DragMode = "question" | "section" | null;

export default function QuestionsPage() {
  const perms = usePermissions();
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [sections, setSections]     = useState<Section[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [qModalOpen, setQModalOpen]         = useState(false);
  const [editingQ, setEditingQ]             = useState<Question | null>(null);
  const [defaultSection, setDefaultSection] = useState<string | undefined>();

  const [secModalOpen, setSecModalOpen] = useState(false);
  const [editingSec, setEditingSec]     = useState<Section | null>(null);
  const [secTitle, setSecTitle]         = useState("");
  const [secSaving, setSecSaving]       = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, secs] = await Promise.all([api.getQuestions(), api.getSections()]);
      setQuestions(qs);
      setSections((secs as Section[]).sort((a, b) => a.display_order - b.display_order));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeQuestions = questions.filter((q) => !q.retired_at);

  const bySection = useCallback(
    (sectionId: string | null) =>
      activeQuestions
        .filter((q) => (sectionId ? q.section_id === sectionId : !q.section_id))
        .sort((a, b) => a.display_order - b.display_order),
    [activeQuestions],
  );

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setActiveId(id);
    setDragMode(id.startsWith("sec-") ? "section" : "question");
  };

  const handleDragOver = (e: DragOverEvent) => {
    if (dragMode !== "question") return;
    const { active, over } = e;
    if (!over) return;
    const activeQ = activeQuestions.find((q) => q.id === active.id);
    if (!activeQ) return;
    const overId = String(over.id);
    let targetSectionId: string | null = null;
    if (overId.startsWith("sec-")) {
      const secId = overId.replace("sec-", "");
      targetSectionId = secId === "__uncat__" ? null : secId;
    } else {
      const overQ = activeQuestions.find((q) => q.id === overId);
      if (overQ) targetSectionId = overQ.section_id;
    }
    if (targetSectionId === activeQ.section_id) return;
    setQuestions((prev) =>
      prev.map((q) => q.id === activeQ.id ? { ...q, section_id: targetSectionId } : q)
    );
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setDragMode(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr   = String(over.id);

    // Section reorder
    if (activeIdStr.startsWith("sec-") && overIdStr.startsWith("sec-")) {
      const activeSecId = activeIdStr.replace("sec-", "");
      const overSecId   = overIdStr.replace("sec-", "");
      if (activeSecId === overSecId) return;
      if (activeSecId === "__uncat__" || overSecId === "__uncat__") return;
      const oldIdx = sections.findIndex((s) => s.id === activeSecId);
      const newIdx = sections.findIndex((s) => s.id === overSecId);
      const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, display_order: i }));
      setSections(reordered);
      try { await api.reorderSections(reordered.map((s) => ({ id: s.id, display_order: s.display_order }))); }
      catch { load(); }
      return;
    }

    // Question reorder / move
    const activeQ = activeQuestions.find((q) => q.id === activeIdStr);
    if (!activeQ) return;

    let targetSectionId: string | null = activeQ.section_id;
    if (overIdStr.startsWith("sec-")) {
      const secId = overIdStr.replace("sec-", "");
      targetSectionId = secId === "__uncat__" ? null : secId;
    } else {
      const overQ = activeQuestions.find((q) => q.id === overIdStr);
      if (overQ) targetSectionId = overQ.section_id;
    }

    const sectionQs = activeQuestions
      .filter((q) => q.section_id === targetSectionId)
      .sort((a, b) => a.display_order - b.display_order);

    let reordered = sectionQs;
    if (activeIdStr !== overIdStr && !overIdStr.startsWith("sec-")) {
      const oldIdx = sectionQs.findIndex((q) => q.id === activeIdStr);
      const newIdx = sectionQs.findIndex((q) => q.id === overIdStr);
      if (oldIdx !== -1 && newIdx !== -1) reordered = arrayMove(sectionQs, oldIdx, newIdx);
    }

    const updated = reordered.map((q, i) => ({ ...q, display_order: i }));
    setQuestions((prev) =>
      prev.map((q) => {
        const u = updated.find((u) => u.id === q.id);
        return u ? { ...q, display_order: u.display_order, section_id: targetSectionId } : q;
      })
    );

    try {
      if (targetSectionId !== activeQ.section_id) {
        await api.updateQuestion(activeQ.id, { section_id: targetSectionId });
      }
      if (updated.length > 0) {
        await api.reorderQuestions(updated.map((q) => ({ id: q.id, display_order: q.display_order })));
      }
    } catch { load(); }
  };

  const handleSaveSection = async () => {
    if (!secTitle.trim()) return;
    setSecSaving(true);
    try {
      if (editingSec) {
        await api.updateSection(editingSec.id, { title: secTitle.trim() });
      } else {
        await api.createSection(secTitle.trim(), sections.length);
      }
      await load();
      setSecModalOpen(false); setSecTitle(""); setEditingSec(null);
    } catch (e: any) { setError(e.message); }
    finally { setSecSaving(false); }
  };

  const handleRetire = async (q: Question) => {
    if (!confirm(`Retire "${q.current_version?.question_text}"?\n\nHistorical data is preserved.`)) return;
    try { await api.retireQuestion(q.id); await load(); }
    catch (e: any) { setError(e.message); }
  };

  const virtualUncat: Section = { id: "__uncat__", title: "Uncategorised", display_order: -1, active: true };
  const uncatQs = bySection(null);
  const allSections: Section[] = [...(uncatQs.length > 0 ? [virtualUncat] : []), ...sections];

  const activeSection = dragMode === "section" && activeId
    ? allSections.find((s) => `sec-${s.id}` === activeId) : null;
  const activeQuestion = dragMode === "question" && activeId
    ? activeQuestions.find((q) => q.id === activeId) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="font-serif font-semibold text-[22px] md:text-[28px] text-[#0D0D0D]">Questions</h1>
          <p className="text-[#888] text-[12px] md:text-[14px] mt-0.5">
            Drag categories to reorder · drag questions between categories freely
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {perms.canManageCategories && (
            <button onClick={() => { setEditingSec(null); setSecTitle(""); setSecModalOpen(true); }}
              className="bg-white border border-[#E6E5E0] text-[#0D0D0D] rounded-[10px] px-3 md:px-4 py-2.5 font-semibold text-[13px] flex items-center gap-1.5 hover:bg-[#F8F7F4] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14"/></svg>
              <span className="hidden sm:inline">New Category</span>
              <span className="sm:hidden">Category</span>
            </button>
          )}
          {perms.canAddEditQuestions && (
            <button onClick={() => { setEditingQ(null); setDefaultSection(undefined); setQModalOpen(true); }}
              className="bg-[#0D0D0D] text-white rounded-[10px] px-3 md:px-4 py-2.5 font-semibold text-[13px] flex items-center gap-1.5 hover:bg-black transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14"/></svg>
              <span className="hidden sm:inline">Add Question</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} onRetry={load} /></div>}
      {loading && <LoadingSpinner />}

      {!loading && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <SortableContext items={allSections.map((s) => `sec-${s.id}`)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {allSections.map((sec) => {
                const isUncat = sec.id === "__uncat__";
                return (
                  <SortableCategoryRow
                    key={sec.id}
                    section={sec}
                    questions={isUncat ? bySection(null) : bySection(sec.id)}
                    onEdit={(q) => { setEditingQ(q); setQModalOpen(true); }}
                    onRetire={handleRetire}
                    onEditSection={isUncat ? undefined : () => { setEditingSec(sec); setSecTitle(sec.title); setSecModalOpen(true); }}
                    onAddQuestion={() => { setEditingQ(null); setDefaultSection(isUncat ? undefined : sec.id); setQModalOpen(true); }}
                  />
                );
              })}
              {allSections.length === 0 && (
                <EmptyState title="No questions yet" description="Create a category then add questions to it." />
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeSection && (
              <div className="bg-white border border-[#E8A020] rounded-[16px] px-5 py-3.5 shadow-[0_8px_32px_rgba(232,160,32,0.2)] cursor-grabbing">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#E8A020] font-bold">{activeSection.title}</span>
              </div>
            )}
            {activeQuestion && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-[10px] bg-white border border-[#E8A020] shadow-[0_8px_24px_rgba(232,160,32,0.15)] cursor-grabbing">
                <span className="text-[#DDD] font-mono text-sm">⠿</span>
                <p className="text-[13.5px] font-medium text-[#0D0D0D] truncate flex-1">
                  {activeQuestion.current_version?.question_text ?? "—"}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      <QuestionModal open={qModalOpen} onClose={() => setQModalOpen(false)}
        question={editingQ} sections={sections} defaultSectionId={defaultSection} onSaved={load} />

      <Modal open={secModalOpen} onClose={() => { setSecModalOpen(false); setEditingSec(null); setSecTitle(""); }}
        title={editingSec ? "Rename Category" : "New Category"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-[#0D0D0D] mb-2">Category name</label>
            <input type="text" value={secTitle} onChange={(e) => setSecTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
              placeholder="e.g. Understanding & Accuracy" autoFocus
              className="w-full border border-[#E6E5E0] rounded-[10px] bg-[#F8F7F4] px-4 py-3 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#E8A020] transition-all" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => { setSecModalOpen(false); setEditingSec(null); setSecTitle(""); }}
              className="flex-1 bg-[#F8F7F4] border border-[#E6E5E0] rounded-[10px] py-2.5 text-[13px] font-semibold hover:bg-[#F0F0ED] transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveSection} disabled={!secTitle.trim() || secSaving}
              className="flex-1 bg-[#0D0D0D] text-white rounded-[10px] py-2.5 text-[13px] font-semibold hover:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {secSaving && <span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />}
              {editingSec ? "Save" : "Create Category"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Sortable category — sortable + droppable on SAME element (same id) ────────

function SortableCategoryRow({ section, questions, onEdit, onRetire, onEditSection, onAddQuestion }: {
  section: Section; questions: Question[];
  onEdit: (q: Question) => void; onRetire: (q: Question) => void;
  onEditSection?: () => void; onAddQuestion: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: `sec-${section.id}` });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 10 : undefined }}
      className={`bg-white rounded-[16px] border overflow-hidden transition-all duration-150 ${
        isOver ? "border-[#E8A020] shadow-[0_0_0_3px_rgba(232,160,32,0.10)]"
               : "border-[#E6E5E0] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.05)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0F0ED]">
        <span {...attributes} {...listeners}
          className="text-[#CCC] hover:text-[#999] cursor-grab active:cursor-grabbing font-mono text-[16px] select-none flex-shrink-0 px-1"
          title="Drag to reorder">⠿</span>

        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#E8A020] font-bold flex-1">
          {section.title}
        </span>

        <span className="font-mono text-[10px] text-[#CCC]">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>

        {onEditSection && (
          <button onClick={onEditSection} title="Rename"
            className="p-1.5 rounded-[7px] text-[#CCC] hover:text-[#0D0D0D] hover:bg-[#F8F7F4] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}

        <button onClick={onAddQuestion}
          className="flex items-center gap-1 px-2.5 py-1 rounded-[7px] text-[#888] hover:text-[#0D0D0D] hover:bg-[#F8F7F4] transition-colors text-[12px] font-medium">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add
        </button>
      </div>

      {/* Questions */}
      <div className={`p-3 min-h-[56px] ${questions.length === 0 ? "flex items-center justify-center" : ""}`}>
        {questions.length === 0 ? (
          <p className="text-[12px] text-[#DDD] font-mono py-1.5">Drop questions here</p>
        ) : (
          <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((q) => (
              <SortableQuestionRow key={q.id} question={q}
                onEdit={() => onEdit(q)} onRetire={() => onRetire(q)} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

// ── Sortable question row ─────────────────────────────────────────────────────

function SortableQuestionRow({ question, onEdit, onRetire }: {
  question: Question; onEdit: () => void; onRetire: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });

  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.25 : 1 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#F8F7F4] group transition-colors mb-1 last:mb-0">
      <span {...attributes} {...listeners}
        className="text-[#DDD] hover:text-[#AAA] cursor-grab active:cursor-grabbing font-mono text-sm select-none flex-shrink-0">
        ⠿
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] md:text-[15px] font-medium text-[#0D0D0D] leading-snug truncate">
          {question.current_version?.question_text ?? "—"}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant={question.question_type as QuestionType}>
            {TYPE_LABELS[question.question_type as QuestionType]}
          </Badge>
          <span className="text-[11px] text-[#CCC]">{question.required ? "Required" : "Optional"}</span>
          {question.include_in_overall_score && question.question_type === "rating" && (
            <span className="text-[11px] text-[#1A6B3C] font-mono">✓ overall</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={onEdit} title="Edit"
          className="p-1.5 rounded-[7px] text-[#CCC] hover:text-[#0D0D0D] hover:bg-[#EDEDEB] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button onClick={onRetire} title="Retire"
          className="p-1.5 rounded-[7px] text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
