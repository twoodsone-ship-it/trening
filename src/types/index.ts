export type MuscleCategory = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number; // 6 to 10
  completed: boolean;
  isWarmup?: boolean;
}

export interface SetHistoryEntry {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
}

export interface ExerciseSession {
  id: string;
  workoutId: string;
  date: string; // ISO date
  targetSets: number;
  minReps: number;
  maxReps: number;
  weight: number;
  sets: SetHistoryEntry[];
  progressionNote?: string;
  totalVolume: number; // weight * reps sum
  estimated1RM: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleCategory;
  targetSets: number;    // e.g. 3
  minReps: number;       // e.g. 8
  maxReps: number;       // e.g. 12
  weightStep: number;    // e.g. 2.5 kg
  currentWeight: number; // current working weight (kg)
  restSeconds: number;   // rest time between sets (e.g. 90)
  notes?: string;
  history: ExerciseSession[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  exercises: Exercise[];
}

export type ProgressionDecision = 
  | 'INCREASE_WEIGHT'     // Hit max reps on all sets with good RPE -> Add weight, drop reps to min
  | 'CONSOLIDATE_WEIGHT'  // Hit reps but RPE 10 / extreme grind -> Repeat same weight
  | 'INCREASE_REPS'       // Working inside the rep bracket -> Add reps
  | 'PLATEAU_WARNING'     // Stalled for 3+ sessions -> Microload or deload recommended
  | 'DELOAD_RECOMMENDED'  // Significant fatigue detected
  | 'FIRST_SESSION';      // No previous session history

export interface ProgressionRecommendation {
  decision: ProgressionDecision;
  nextWeight: number;
  targetRepRange: string;
  badgeText: string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  analysis: string;
  suggestedAction: string;
  consecutivePlateauCount: number;
}

export interface ActiveExerciseSession {
  exerciseId: string;
  name: string;
  category: MuscleCategory;
  targetSets: number;
  minReps: number;
  maxReps: number;
  weightStep: number;
  targetWeight: number;
  restSeconds: number;
  sets: WorkoutSet[];
  recommendation: ProgressionRecommendation;
  previousPerformance?: {
    date: string;
    weight: number;
    sets: SetHistoryEntry[];
  };
}

export interface CompletedWorkout {
  id: string;
  templateId: string;
  templateName: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  exercises: {
    exerciseId: string;
    name: string;
    category: MuscleCategory;
    targetSets: number;
    minReps: number;
    maxReps: number;
    workingWeight: number;
    sets: SetHistoryEntry[];
    progression: ProgressionRecommendation;
  }[];
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number;
  barbellWeightKg: number; // default 20 kg
  unit: 'kg' | 'lbs';
}
