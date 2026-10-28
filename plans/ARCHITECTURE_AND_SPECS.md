# Technical Architecture & Smart Double Progression Specification

## 1. Concept: Smart Double Progression (Умная Двойная Прогрессия)

### Traditional Double Progression
- Two variables: **Reps** ($R$) and **Weight** ($W$).
- Set a rep range target $[R_{\min}, R_{\max}]$, e.g., $8 - 12$ reps across $N$ sets (e.g. 3 sets).
- Fix weight $W$. In each workout, strive to add repetitions.
- Once the athlete completes all sets at $R_{\max}$ (e.g., $3 \times 12$ reps), progress weight by $\Delta W$ (e.g., $+2.5\text{ kg}$) and reset rep target to $R_{\min}$ (e.g., $3 \times 8$).

### Why "Smart" Double Progression?
Traditional double progression has failure modes:
1. **Premature jumps**: An athlete grinds out $12, 12, 12$ at RPE 10 with broken form, jumps $+2.5\text{ kg}$ next session, and drops to $8, 6, 5$.
2. **Plateaus**: Athlete stays stuck at $11, 10, 9$ for a month without guidance on micro-loading, deloading, or volume adjustment.
3. **Conservative delays**: Athlete hits $12, 12, 11$ easily with 3 reps in reserve, but traditional rules force them to repeat the entire week.

### Smart Progression Rules & Heuristics
1. **Target Met with Reserve (Confidence Threshold)**:
   - If $\sum \text{reps} \ge N \times R_{\max}$ AND average $\text{RPE} \le 8.5$ (or $\text{RIR} \ge 1.5$):
     - **Recommendation**: $\text{INCREASE\_WEIGHT}$ ($\Delta W = \text{standard step}$, e.g. $+2.5\text{kg}$ / $+5\text{kg}$).
     - **Status Badge**: ⚡ *Готов к повышению веса (Weight Progression Ready)*.
2. **Target Met at Absolute Maximum Grind (RPE 9.5 - 10)**:
   - If target reps met, but last set was absolute RPE 10 / form breakdown:
     - **Recommendation**: $\text{CONSOLIDATE}$ (repeat weight one more session to solidify technique and lower RPE before increasing).
     - **Status Badge**: 🔄 *Закрепление веса (Consolidation)*.
3. **Threshold Proximity Bonus**:
   - If athlete missed by only 1 rep total (e.g. 12, 12, 11 on an 8-12 range) and RPE is moderate:
     - **Recommendation**: $\text{REPS\_PROGRESSION}$ (Target: add 1 rep on final set next session).
4. **Plateau Detection**:
   - If for 3 consecutive sessions, the top set reps do not increase and total tonnage doesn't improve by $>1\%$:
     - **Recommendation**: $\text{PLATEAU\_ALERT}$
     - Suggests:
       - **Option A (Micro-loading)**: Increase by $+1\text{kg}$ or $+0.5\text{kg}$ instead of standard step.
       - **Option B (Deload)**: Reduce weight by $10\%$ for 1 session to flush accumulated fatigue.
       - **Option C (Rep Range Shift)**: Temporarily shift to a strength bracket (e.g., 5-8 reps) or hypertrophy bracket (10-15 reps).

---

## 2. Data Models (TypeScript)

```typescript
export interface Exercise {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
  targetSets: number; // e.g. 3
  minReps: number;    // e.g. 8
  maxReps: number;    // e.g. 12
  weightStep: number; // e.g. 2.5 (kg)
  currentWeight: number; // e.g. 80
  notes?: string;
  history: ExerciseSession[];
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number; // 6 - 10
  completed: boolean;
}

export interface ExerciseSession {
  date: string; // ISO string
  weight: number;
  sets: WorkoutSet[];
  progressionNote?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

export interface ActiveWorkout {
  id: string;
  templateId: string;
  name: string;
  startTime: number;
  endTime?: number;
  exercises: {
    exerciseId: string;
    name: string;
    category: string;
    targetSets: number;
    minReps: number;
    maxReps: number;
    weightStep: number;
    targetWeight: number;
    sets: WorkoutSet[];
    recommendation: ProgressionRecommendation;
  }[];
}

export interface ProgressionRecommendation {
  type: 'increase_weight' | 'consolidate' | 'increase_reps' | 'deload_suggested' | 'first_time';
  nextWeight: number;
  nextRepTarget: string;
  message: string;
  badge: {
    label: string;
    color: string;
  };
}
```

---

## 3. Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark gym theme (`zinc-900`, `zinc-950`, emerald accents)
- **Icons**: Lucide React
- **Sound**: Web Audio API (zero external mp3 dependencies, works completely offline)
- **Haptics**: Native `navigator.vibrate`
- **PWA**: `vite-plugin-pwa` with custom manifest and service worker
- **Export/Import**: JSON backup/restore with file reader & download trigger
- **Deploy**: GitHub Pages via `.github/workflows/deploy.yml` + relative path support in `vite.config.ts`.
