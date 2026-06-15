'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { useStrngthStore, Experience, FitnessGoal, Gender } from '@/lib/strngth/store';
import StepFrame from '@/components/strngth/onboarding/StepFrame';
import OptionCard from '@/components/strngth/onboarding/OptionCard';
import WheelPicker from '@/components/strngth/onboarding/WheelPicker';
import ScaleRuler from '@/components/strngth/onboarding/ScaleRuler';
import Mascot from '@/components/strngth/onboarding/Mascot';
import SpeechBubble from '@/components/strngth/onboarding/SpeechBubble';

const CYAN = '#04141d';
const TOTAL_STEPS = 7; // question steps after the intro

const EXPERIENCE_OPTS: { id: Experience; icon: string; title: string; sub: string }[] = [
  { id: 'never', icon: '🌱', title: 'Never worked out', sub: 'Complete beginner — starting from zero' },
  { id: 'beginner', icon: '⚡', title: 'Beginner', sub: 'Some experience, still learning the basics' },
  { id: 'intermediate', icon: '🔥', title: 'Intermediate', sub: 'Consistent training for 1–2 years' },
  { id: 'advanced', icon: '🏆', title: 'Advanced', sub: 'Training seriously for 3+ years' },
];

const GOAL_OPTS: { id: FitnessGoal; icon: string; title: string }[] = [
  { id: 'stronger', icon: '🏋️', title: 'Become stronger' },
  { id: 'muscle', icon: '💪', title: 'Build muscle mass' },
  { id: 'consistent', icon: '🔥', title: 'Become more consistent' },
  { id: 'lose', icon: '🥗', title: 'Lose weight' },
  { id: 'ranks', icon: '⭐', title: 'Just get my ranks' },
];

const DURATION_OPTS: { mins: number; tag: string; sub: string }[] = [
  { mins: 15, tag: 'Light', sub: 'Quick sessions, easy to fit in' },
  { mins: 30, tag: 'Casual', sub: 'Solid daily habit' },
  { mins: 45, tag: 'Standard', sub: 'Recommended for steady progress' },
  { mins: 60, tag: 'Serious', sub: 'Full workout, great results' },
  { mins: 90, tag: 'Beast Mode', sub: 'Maximum effort, maximum gains' },
];

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

function bmiInfo(weightKg: number, gender: Gender | null) {
  const h = gender === 'female' ? 1.65 : gender === 'male' ? 1.78 : 1.72; // assumed height (m)
  const bmi = weightKg / (h * h);
  let label = 'Normal';
  let color = '#10b981';
  if (bmi < 18.5) { label = 'Underweight'; color = '#00d4ff'; }
  else if (bmi >= 25 && bmi < 30) { label = 'Overweight'; color = '#f59e0b'; }
  else if (bmi >= 30) { label = 'Obese'; color = '#ef4444'; }
  return { value: bmi.toFixed(1), label, color };
}

export default function OnboardingPage() {
  const router = useRouter();
  const onboarding = useStrngthStore(s => s.onboarding);
  const setOnboarding = useStrngthStore(s => s.setOnboarding);
  const completeOnboarding = useStrngthStore(s => s.completeOnboarding);

  const [[step, dir], setStepState] = useState<[number, number]>([0, 1]);
  const go = (next: number) => setStepState([next, next > step ? 1 : -1]);

  const name = onboarding.name.trim();
  const progress = step === 0 ? 0 : step / TOTAL_STEPS;

  function back() {
    if (step === 0) router.push('/strngth/welcome');
    else go(step - 1);
  }

  // Apply the entered profile (name → dashboard) now, then hand off to Sign In.
  // This guarantees the dashboard shows the onboarding name regardless of how
  // the user proceeds from the Sign In screen.
  function finish() {
    completeOnboarding();
    router.push('/strngth/signin');
  }

  // Weight display (store is kg; show in chosen unit)
  const isLbs = onboarding.unit === 'lbs';
  const dispWeight = isLbs ? Math.round(onboarding.weight * 2.20462) : Math.round(onboarding.weight);
  const setDispWeight = (v: number) => setOnboarding({ weight: isLbs ? v / 2.20462 : v });
  const bmi = bmiInfo(onboarding.weight, onboarding.gender);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={step}
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
          {/* ── Step 0: Intro mascot ───────────────────────────── */}
          {step === 0 && (
            <div className="h-dvh flex flex-col items-center px-6 pt-6 pb-6 max-w-2xl mx-auto w-full">
              <div className="w-full flex items-center">
                <button onClick={back} aria-label="Back" className="w-8 h-8 flex items-center justify-center -ml-1" style={{ color: 'var(--gym-text-dim)' }}>
                  ‹
                </button>
              </div>
              <div className="mt-2 w-full max-w-md">
                <SpeechBubble tail="down">
                  <span className="block text-center">I just have a few questions for you and we can get started!</span>
                </SpeechBubble>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Mascot size={190} />
              </div>
              <button
                onClick={() => go(1)}
                className="w-full py-4 rounded-2xl font-black text-base tracking-wide"
                style={{ background: '#00d4ff', color: CYAN, boxShadow: '0 0 24px #00d4ff40', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}
              >
                SOUNDS GOOD!
              </button>
            </div>
          )}

          {/* ── Step 1: Name ───────────────────────────────────── */}
          {step === 1 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble="What should we call you?"
              title="What's your name?"
              primaryLabel="NEXT"
              onPrimary={() => go(2)}
              onSkip={() => go(2)}
            >
              <div className="relative">
                <Pencil size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gym-text-tertiary)' }} />
                <input
                  autoFocus
                  value={onboarding.name}
                  onChange={e => setOnboarding({ name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full h-14 pl-11 pr-4 rounded-2xl text-base outline-none"
                  style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border-2)', color: 'var(--gym-text)', caretColor: '#00d4ff' }}
                />
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--gym-text-muted)' }}>
                You can change your name later in your profile
              </p>
            </StepFrame>
          )}

          {/* ── Step 2: Experience ─────────────────────────────── */}
          {step === 2 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble={<>Nice to meet you{name ? `, ${name}` : ''}! How experienced are you?</>}
              title="Experience Level"
              onPrimary={() => go(3)}
              primaryDisabled={!onboarding.experience}
            >
              <div className="space-y-3">
                {EXPERIENCE_OPTS.map(o => (
                  <OptionCard key={o.id} selected={onboarding.experience === o.id} onClick={() => setOnboarding({ experience: o.id })} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{o.icon}</span>
                      <div>
                        <p className="font-bold text-[15px]" style={{ color: 'var(--gym-text)' }}>{o.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gym-text-muted)' }}>{o.sub}</p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </StepFrame>
          )}

          {/* ── Step 3: Goal ───────────────────────────────────── */}
          {step === 3 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble="What is your top fitness goal?"
              title="Fitness Goal"
              onPrimary={() => go(4)}
              primaryDisabled={!onboarding.goal}
            >
              <div className="space-y-3">
                {GOAL_OPTS.map(o => (
                  <OptionCard key={o.id} selected={onboarding.goal === o.id} onClick={() => setOnboarding({ goal: o.id })} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{o.icon}</span>
                      <p className="font-bold text-[15px]" style={{ color: 'var(--gym-text)' }}>{o.title}</p>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </StepFrame>
          )}

          {/* ── Step 4: Gender ─────────────────────────────────── */}
          {step === 4 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble="Alright! Let's get some basic info down."
              title="I am…"
              onPrimary={() => go(5)}
              primaryDisabled={!onboarding.gender}
            >
              <div className="grid grid-cols-2 gap-3">
                {([['male', '♂', 'MALE'], ['female', '♀', 'FEMALE']] as [Gender, string, string][]).map(([id, sym, label]) => (
                  <OptionCard key={id} selected={onboarding.gender === id} onClick={() => setOnboarding({ gender: id })} className="py-10 flex flex-col items-center justify-center gap-3">
                    <span className="text-5xl leading-none" style={{ color: onboarding.gender === id ? '#00d4ff' : 'var(--gym-text-muted)' }}>{sym}</span>
                    <span className="text-sm font-bold tracking-widest" style={{ color: onboarding.gender === id ? '#00d4ff' : 'var(--gym-text-muted)' }}>{label}</span>
                  </OptionCard>
                ))}
              </div>
            </StepFrame>
          )}

          {/* ── Step 5: Age ────────────────────────────────────── */}
          {step === 5 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble="How old are you?"
              title="Your Age"
              onPrimary={() => go(6)}
            >
              <div className="flex flex-col items-center justify-center mt-8">
                <WheelPicker min={13} max={80} value={onboarding.age} onChange={v => setOnboarding({ age: v })} />
              </div>
            </StepFrame>
          )}

          {/* ── Step 6: Weight ─────────────────────────────────── */}
          {step === 6 && (
            <StepFrame
              progress={progress}
              onBack={back}
              bubble="What's your current weight?"
              title="Your Weight"
              onPrimary={() => go(7)}
            >
              <div className="flex flex-col items-center mt-2">
                {/* Unit toggle */}
                <div className="flex rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--gym-border-2)' }}>
                  {(['kg', 'lbs'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setOnboarding({ unit: u })}
                      className="px-7 py-2 text-sm font-black tracking-wider uppercase"
                      style={{ background: onboarding.unit === u ? '#00d4ff' : 'transparent', color: onboarding.unit === u ? '#04141d' : 'var(--gym-text-muted)' }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-7xl font-black leading-none" style={{ color: 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>
                    {onboarding.unit === 'kg' ? dispWeight.toFixed(1) : dispWeight}
                  </span>
                  <span className="text-2xl font-bold mb-2" style={{ color: 'var(--gym-text-muted)' }}>{onboarding.unit}</span>
                </div>
                {/* BMI card */}
                <div className="w-full rounded-2xl px-4 py-3 my-6 flex items-center justify-between" style={{ background: 'var(--gym-surface-subtle)', border: '1px solid var(--gym-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--gym-text-muted)' }}>BMI (est.)</span>
                  <span className="text-sm font-bold">
                    <span style={{ color: bmi.color }}>{bmi.value}</span>
                    <span style={{ color: 'var(--gym-text-muted)' }}> · </span>
                    <span style={{ color: bmi.color }}>{bmi.label}</span>
                  </span>
                </div>
                <div className="w-full" style={{ marginLeft: -20, marginRight: -20, width: 'calc(100% + 40px)' }}>
                  <ScaleRuler
                    min={isLbs ? 66 : 30}
                    max={isLbs ? 440 : 200}
                    value={dispWeight}
                    onChange={setDispWeight}
                  />
                </div>
              </div>
            </StepFrame>
          )}

          {/* ── Step 7: Workout duration (final) ───────────────── */}
          {step === 7 && (
            <StepFrame
              progress={1}
              onBack={back}
              bubble="How long do you want your workouts to be?"
              title="Workout Duration"
              primaryLabel="NEXT"
              onPrimary={finish}
              primaryDisabled={!onboarding.workoutDuration}
              onSkip={finish}
              skipLabel="SKIP"
            >
              <div className="space-y-3">
                {DURATION_OPTS.map(o => (
                  <OptionCard key={o.mins} selected={onboarding.workoutDuration === o.mins} onClick={() => setOnboarding({ workoutDuration: o.mins })} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 text-center" style={{ width: 56 }}>
                        <p className="text-lg font-black leading-none" style={{ color: onboarding.workoutDuration === o.mins ? '#00d4ff' : 'var(--gym-text)', fontFamily: 'var(--gym-font-display-loaded, Orbitron, monospace)' }}>{o.mins}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--gym-text-tertiary)' }}>{o.tag}</p>
                      </div>
                      <div className="border-l pl-4" style={{ borderColor: 'var(--gym-border)' }}>
                        <p className="font-bold text-[15px]" style={{ color: 'var(--gym-text)' }}>{o.mins} minutes</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gym-text-muted)' }}>{o.sub}</p>
                      </div>
                    </div>
                  </OptionCard>
                ))}
              </div>
            </StepFrame>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
