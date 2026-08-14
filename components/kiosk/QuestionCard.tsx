"use client";
import { StarRating } from "./StarRating";
import { MultipleChoice } from "./MultipleChoice";
import type { Question, AnswerInput } from "@/types";

interface QuestionCardProps {
  question: Question;
  answer: AnswerInput | undefined;
  onAnswer: (a: AnswerInput) => void;
}

export function QuestionCard({ question, answer, onAnswer }: QuestionCardProps) {
  const cv = question.current_version!;

  const handleRating = (v: number) => {
    onAnswer({
      question_id: question.id,
      question_version_id: cv.id,
      rating_value: v,
    });
  };

  const handleText = (v: string) => {
    onAnswer({
      question_id: question.id,
      question_version_id: cv.id,
      text_value: v,
    });
  };

  const handleOption = (optId: string) => {
    onAnswer({
      question_id: question.id,
      question_version_id: cv.id,
      selected_option_id: optId,
    });
  };

  return (
    <div className="bg-paper-2 border border-line rounded-card p-5 md:p-7 mb-3 md:mb-4 shadow-card">
      <p className="text-[15.5px] md:text-[18px] font-medium mb-4 md:mb-6 leading-snug">
        {cv.question_text}
        {question.required && <span className="text-attention ml-1">*</span>}
        {!question.required && (
          <span className="text-ink-soft font-normal ml-1 text-sm md:text-base">(ግዴታ አይደለም)</span>
        )}
      </p>

      {cv.question_type === "rating" && (
        <StarRating
          value={answer?.rating_value ?? null}
          onChange={handleRating}
          questionId={question.id}
        />
      )}

      {cv.question_type === "short_text" && (
        <input
          type="text"
          value={answer?.text_value ?? ""}
          onChange={(e) => handleText(e.target.value)}
          placeholder="Your answer…"
          className="w-full border border-line rounded-xl bg-paper px-4 py-2.5 md:py-3 text-[14.5px] md:text-[17px] focus:outline-2 focus:outline-positive"
        />
      )}

      {cv.question_type === "paragraph" && (
        <>
          <textarea
            value={answer?.text_value ?? ""}
            onChange={(e) => handleText(e.target.value)}
            placeholder="አስተያየትዎን ይጻፉ…"
            rows={3}
            className="w-full border border-line rounded-xl bg-paper px-4 py-3 text-[14.5px] md:text-[17px] resize-y focus:outline-2 focus:outline-positive"
          />
          <p className="text-xs md:text-sm text-ink-soft mt-1.5 opacity-75">
            ግዴታ አይደለም — ነገር ግን ዝርዝር አስተያየትዎ የበለጠ ይረዳናል።
          </p>
        </>
      )}

      {cv.question_type === "multiple_choice" && (
        <MultipleChoice
          options={cv.options}
          value={answer?.selected_option_id ?? null}
          onChange={handleOption}
        />
      )}
    </div>
  );
}
