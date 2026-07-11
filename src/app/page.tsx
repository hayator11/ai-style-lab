import Link from 'next/link';

const features = [
  '写真チェックを中心に傾向を確認',
  '好みや体感も合わせて提案',
  '場面に合わせたスタイル提案へつなげる',
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-5">
          <p className="text-sm font-semibold text-rose-700">AI Style Concierge</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-stone-950 md:text-6xl">
            似合うを入口に、挑戦する自信を育てる。
          </h1>
          <p className="max-w-2xl text-base leading-8 text-stone-700">
            AIスタイルLabは、写真チェックを入口に、パーソナルカラー・骨格・顔タイプの傾向を確認し、場面に応じたスタイル提案へ広げていくサービスです。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-lg border border-stone-200 bg-white p-5 text-sm font-medium text-stone-700 shadow-sm">
              {feature}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white" href="/upload">
            写真を追加する
          </Link>
          <Link className="rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900" href="/questionnaire">
            好みを入力する
          </Link>
        </div>
      </section>
    </main>
  );
}
