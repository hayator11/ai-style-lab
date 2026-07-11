'use client';

import { supportQuestions } from '@/data/supportQuestions';
import { getSavedSupportAnswers, SUPPORT_ANSWERS_STORAGE_KEY } from '@/lib/diagnosis/photoSession';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function QuestionnairePage() {
  const [answers, setAnswers] = useState(getSavedSupportAnswers);
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    window.localStorage.setItem(SUPPORT_ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  function selectAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-rose-700">好みを入力</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">写真だけでは分からないこと</h1>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            普段の好みや、服を着たときの体感を教えてください。写真と合わせることで、より自然に取り入れやすい提案につなげます。
          </p>
          <p className="mt-3 text-sm font-semibold text-stone-700">
            回答済み: {answeredCount} / {supportQuestions.length}
          </p>
        </div>
        <div className="space-y-4">
          {supportQuestions.map((question, index) => (
            <article key={question.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-stone-500">Q{index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-stone-950">{question.label}</h2>
              <p className="mt-2 text-xs text-stone-500">この回答は、色・形・印象の提案に反映します。</p>
              <div className="mt-4 grid gap-2">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    className={`rounded-md border px-4 py-3 text-left text-sm ${
                      answers[question.id] === option.value
                        ? 'border-stone-950 bg-stone-950 text-white'
                        : 'border-stone-200 text-stone-700'
                    }`}
                    type="button"
                    onClick={() => selectAnswer(question.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white" href="/result">
            結果を見る
          </Link>
          <Link className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900" href="/upload">
            写真を見直す
          </Link>
        </div>
      </section>
    </main>
  );
}
