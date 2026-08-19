import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-950 font-sans overflow-hidden">
      <BackgroundRippleEffect />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center w-full px-8 py-20">
        <div className="flex flex-col items-center gap-6 text-center max-w-5xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight text-neutral-300 drop-shadow-lg">
            Skill Up
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed text-zinc-400 max-w-3xl">
            Elevate your skills, unlock your potential. Interactive learning platform designed to help you grow and achieve your goals.
          </p>
          <a
            href="/learn"
            className="mt-4 px-6 py-2 rounded-lg bg-neutral-300 text-black text-lg font-bold shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] hover:-translate-y-1 transition-transform duration-200 cursor-pointer hover:bg-neutral-200"
          >
            Get Started
          </a>
        </div>
      </main>
    </div>
  );
}
