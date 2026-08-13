"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import type { Question, QuestionType } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  sections: { id: string; title: string }[];
  defaultSectionId?: string;
  onSaved: () => void;
}

const TYPES: { value: QuestionType; label: string }[] = [
  { value: "rating", label: "★ Rating 1–5" },
  { value: "short_text", label: "Short Text" },
  { value: "paragraph", label: "¶ Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
];

export function QuestionModal({ open, onClose, question, sections, defaultSectionId, onSaved }: Props) {
  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>("rating");
  const [sectionId, setSectionId] = useState("");
  const [required, setRequired] = useState(true);
  const [includeOverall, setIncludeOverall] = useState(true);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (question) {
      const cv = question.current_version;
      setText(cv?.question_text ?? "");
      setType(question.question_type);
      setSectionId(question.section_id ?? defaultSectionId ?? "");
      setRequired(question.required);
      setIncludeOverall(question.include_in_overall_score);
      setOptions(cv?.options?.map((o) => o.option_text) ?? ["", ""]);
    } else {
      setText(""); setType("rating"); setSectionId(defaultSectionId ?? sections[0]?.id ?? "");
      setRequired(true); setIncludeOverall(true); setOptions(["", ""]);
    }
    setError("");
  }, [open, question, sections]);

  const handleSave = async () => {
    if (!text.trim()) { setError("Question text is required."); return; }
    if (type === "multiple_choice" && options.filter((o) => o.trim()).length < 2) {
      setError("Multiple choice requires at least 2 options."); return;
    }
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        question_text: text.trim(),
        question_type: type,
        section_id: sectionId || null,
        required,
        include_in_overall_score: includeOverall,
        options: type === "multiple_choice"
          ? options.filter((o) => o.trim()).map((o, i) => ({ option_text: o, display_order: i }))
          : [],
      };
      if (question) {
        await api.updateQuestion(question.id, body);
      } else {
        await api.createQuestion(body);
      }
      onSaved();
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={question ? "Edit Question" : "Add Question"}>
      <div className="flex flex-col gap-4">
        {error && <div className="text-sm text-attention bg-attention-soft px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-semibold mb-1.5">Question text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full border border-line rounded-lg bg-paper px-3 py-2.5 text-sm resize-none focus:outline-2 focus:outline-positive"
            placeholder="e.g. How easy was it to navigate the interaction?"
          />
          {question && (
            <p className="text-[11px] text-ink-soft mt-1">
              Editing the text creates a new version. Historical answers are preserved.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className="w-full border border-line rounded-lg bg-paper px-3 py-2.5 text-sm focus:outline-2 focus:outline-positive"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Section</label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full border border-line rounded-lg bg-paper px-3 py-2.5 text-sm focus:outline-2 focus:outline-positive"
            >
              <option value="">No section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>

        {type === "multiple_choice" && (
          <div>
            <label className="block text-sm font-semibold mb-1.5">Options</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={opt}
                  onChange={(e) => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 border border-line rounded-lg bg-paper px-3 py-2 text-sm focus:outline-2 focus:outline-positive"
                />
                {options.length > 2 && (
                  <button onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    className="text-attention hover:bg-attention-soft px-2 rounded-lg transition-colors">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setOptions([...options, ""])}
              className="text-sm text-positive font-semibold hover:underline mt-1">
              + Add option
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-1">
          <label className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Required</div>
              <div className="text-xs text-ink-soft">Prevent submission without an answer</div>
            </div>
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 accent-positive" />
          </label>
          {type === "rating" && (
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Include in overall score</div>
                <div className="text-xs text-ink-soft">Contributes to the overall average</div>
              </div>
              <input type="checkbox" checked={includeOverall} onChange={(e) => setIncludeOverall(e.target.checked)}
                className="w-4 h-4 accent-positive" />
            </label>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t border-line">
          <button onClick={onClose} className="flex-1 bg-paper border border-line rounded-[9px] py-2.5 text-sm font-semibold hover:bg-paper-2 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 bg-ink text-white rounded-[9px] py-2.5 text-sm font-semibold hover:brightness-125 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {question ? "Save Changes" : "Create Question"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
