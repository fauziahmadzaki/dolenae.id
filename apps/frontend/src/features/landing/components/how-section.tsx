import { steps } from "~/features/landing/data";

export function HowSection() {
  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold text-on-primary">
            Tiga langkah sebelum berangkat
          </h2>
          <p className="mt-1 text-on-primary/75">
            Dari menemukan destinasi sampai siap di basecamp.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 rounded-xl border border-on-primary/15 bg-on-primary/5 p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-on-primary font-display text-lg font-bold text-primary">
                {step.n}
              </span>
              <h3 className="font-display text-lg font-bold text-on-primary">
                {step.title}
              </h3>
              <p className="text-sm text-on-primary/75">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
