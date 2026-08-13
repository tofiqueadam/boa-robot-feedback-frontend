"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { generateSessionId } from "@/lib/utils";
import { KioskHeader } from "@/components/kiosk/KioskHeader";
import { QuestionCard } from "@/components/kiosk/QuestionCard";
import { ThankYou } from "@/components/kiosk/ThankYou";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import type { RobotInfo, Section, PublicSettings, AnswerInput } from "@/types";

interface Props { robotCode: string }

type PageState = "loading" | "form" | "submitting" | "thanks" | "error" | "closed" | "not_found";

export function KioskForm({ robotCode }: Props) {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [robot, setRobot] = useState<RobotInfo | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [answers, setAnswers] = useState<Map<string, AnswerInput>>(new Map());
  const [errorMsg, setErrorMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [sessionId] = useState(generateSessionId);
  // Track if we have already loaded — prevents re-fetching (and answer wipe) on Fast Refresh
  const loadedRef = useRef(false);

  const load = useCallback(async (force = false) => {
    // Only load once unless forced (e.g. retry after error)
    if (loadedRef.current && !force) return;
    setPageState("loading");
    try {
      const [robotData, sectionsData, settingsData] = await Promise.all([
        api.getRobot(robotCode),
        api.getActiveQuestions(),
        api.getPublicSettings(),
      ]);
      if (!settingsData.accept_responses) { setPageState("closed"); return; }
      setRobot(robotData);
      setSections(sectionsData);
      setSettings(settingsData);
      loadedRef.current = true;
      setPageState("form");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("404") || msg.includes("not found")) setPageState("not_found");
      else if (msg.includes("410") || msg.includes("inactive")) setPageState("error");
      else { setErrorMsg(msg); setPageState("error"); }
    }
  }, [robotCode]);

  useEffect(() => { load(); }, [load]);

  const handleAnswer = (a: AnswerInput) => {
    setAnswers((prev) => new Map(prev).set(a.question_id, a));
  };

  const allQuestions = sections.flatMap((s) => s.questions);
  const requiredQuestions = allQuestions.filter((q) => q.required);
  const answeredRequired = requiredQuestions.filter((q) => {
    const a = answers.get(q.id);
    if (!a) return false;
    if (q.question_type === "rating") return a.rating_value != null;
    if (q.question_type === "multiple_choice") return a.selected_option_id != null;
    return (a.text_value?.trim() ?? "") !== "";
  });
  const totalRating = allQuestions.filter((q) => q.question_type === "rating").length;
  const ratingAnswered = allQuestions.filter((q) => {
    const a = answers.get(q.id);
    return q.question_type === "rating" && a?.rating_value != null;
  }).length;
  const canSubmit = answeredRequired.length === requiredQuestions.length;

  const handleSubmit = async () => {
    if (!robot || !canSubmit) return;
    setSubmitError("");
    setPageState("submitting");
    const payload = {
      robot_code: robot.robot_code,
      session_id: sessionId,
      answers: Array.from(answers.values()),
    };
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await api.submitFeedback(payload);
        setPageState("thanks");
        return;
      } catch (e: any) {
        if (attempt === 2) {
          setSubmitError(e.message || "Submission failed. Please try again.");
          setPageState("form");
        }
      }
    }
  };

  const handleReset = () => {
    setAnswers(new Map());
    setSubmitError("");
    setPageState("form");
  };

  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <LoadingSpinner />
      </div>
    );
  }

  if (pageState === "not_found") {
    return (
      <FeedbackError
        title="Robot not found"
        description={`No robot found with code "${robotCode.toUpperCase()}". Please check and try again.`}
      />
    );
  }

  if (pageState === "closed") {
    return (
      <FeedbackError
        title="Feedback is currently closed."
        description="Thank you for your interest. Feedback collection is temporarily paused."
      />
    );
  }

  if (pageState === "error" && !submitError) {
    return (
      <FeedbackError
        title="Robot unavailable"
        description={errorMsg || "This robot is not currently accepting feedback."}
        onRetry={load.bind(null, true)}
      />
    );
  }

  if (pageState === "thanks" && settings) {
    return (
      <div className="flex justify-center px-5 py-14 min-h-screen bg-paper">
        <div className="w-full max-w-[600px]">
          <ThankYou
            message={settings.thank_you_message}
            locationName={robot?.location.name ?? ""}
            onReset={handleReset}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-5 py-12 pb-24 min-h-screen bg-paper">
      <div className="w-full max-w-[600px]">
        {robot && settings && (
          <KioskHeader
            robotName={robot.name}
            locationName={robot.location.name}
            formDescription={settings.form_description}
          />
        )}

        {submitError && (
          <div className="mb-4">
            <ErrorBanner message={submitError} onRetry={handleSubmit} />
          </div>
        )}

        {sections.map((section) => (
          <div key={section.id} className="mb-6">
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-gold-deep font-bold mb-3 pl-0.5">
              {section.title}
            </div>
            {section.questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                answer={answers.get(q.id)}
                onAnswer={handleAnswer}
              />
            ))}
          </div>
        ))}

        {/* Submit bar */}
        <div className="mt-8 bg-[#0D0D0D] rounded-[16px] px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalRating }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i < ratingAnswered
                      ? "w-4 bg-[#E8A020]"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-white/35">
              {ratingAnswered}/{totalRating}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || pageState === "submitting"}
            className="w-full sm:w-auto bg-[#E8A020] text-[#0D0D0D] rounded-[10px] px-7 py-3 font-bold text-[13.5px] tracking-wide transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          >
            {pageState === "submitting" && (
              <span className="w-4 h-4 border-2 border-[#0D0D0D]/25 border-t-[#0D0D0D] rounded-full animate-spin" />
            )}
            አስተያየቱን ላክ
          </button>
        </div>

        <p className="text-center font-mono text-[11px] tracking-wider text-ink-soft opacity-50 mt-8">
          BANK OF ABYSSINIA · THE CHOICE FOR ALL
        </p>
      </div>
    </div>
  );
}

function FeedbackError({ title, description, onRetry }: {
  title: string; description: string; onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F6F5F0]">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/boa-logo.jpeg"
              alt="Bank of Abyssinia"
              width={48}
              height={48}
              className="rounded-[10px] shadow-sm flex-shrink-0"
              priority
            />
            <div className="text-left">
              <div className="font-semibold text-[14px] text-[#0D0D0D] leading-tight" style={{ fontFamily: "serif" }}>
                አቢሲንያ ባንክ
              </div>
              <div className="text-[#888] text-[11.5px] leading-tight mt-0.5">
                Bank of Abyssinia
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#AAA]">
            Robot Feedback
          </div>
        </div>

        {/* Error icon */}
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth={2} className="w-6 h-6">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>

        <h2 className="font-serif font-semibold text-[22px] text-[#0D0D0D] mb-2">{title}</h2>
        <p className="text-[#666] text-[14px] leading-relaxed">{description}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 bg-[#0D0D0D] text-white rounded-[10px] px-6 py-2.5 font-semibold text-[13.5px] hover:bg-black transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
