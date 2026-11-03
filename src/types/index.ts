export type MuscleCategory = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';

export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'smith' | 'bodyweight';

export interface ExerciseTechniqueGuide {
  setup: string;
  execution: string;
  breathing: string;
  mistakes: string[];
  primaryMuscles: string;
}

export type WorkoutSetType = 'warmup' | 'working' | 'failure' | 'dropset';

export type ReadinessLevel = 'optimal' | 'tired' | 'sleep_deprived';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isWarmup?: boolean;
  type?: WorkoutSetType;
}

export interface SetHistoryEntry {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  type?: WorkoutSetType;
  isWarmup?: boolean;
}

export interface ExerciseSession {
  id: string;
  workoutId: string;
  date: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  weight: number;
  sets: SetHistoryEntry[];
  progressionNote?: string;
  totalVolume: number;
  estimated1RM: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment?: EquipmentType;
  animationType?: string;
  gifUrl?: string;
  technique?: ExerciseTechniqueGuide;
  alternatives?: string[];
  weekVariant?: 'A' | 'B' | 'both';
  /** Shared id groups exercises into a superset / circuit */
  supersetGroupId?: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  weightStep: number;
  currentWeight: number;
  restSeconds: number;
  notes?: string;
  history: ExerciseSession[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  weekVariant?: 'A' | 'B' | 'all';
  /** Optional day-of-week hint: 0=Sun … 6=Sat */
  scheduledDays?: number[];
  exercises: Exercise[];
}

export type ProgressionDecision =
  | 'INCREASE_WEIGHT'
  | 'CONSOLIDATE_WEIGHT'
  | 'INCREASE_REPS'
  | 'PLATEAU_WARNING'
  | 'DELOAD_RECOMMENDED'
  | 'FIRST_SESSION';

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
  equipment?: EquipmentType;
  animationType?: string;
  gifUrl?: string;
  technique?: ExerciseTechniqueGuide;
  alternatives?: string[];
  supersetGroupId?: string;
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

export interface ActiveWorkout {
  templateId: string;
  templateName: string;
  readiness?: ReadinessLevel;
  startTime: number;
  exercises: ActiveExerciseSession[];
}

export interface CompletedWorkout {
  id: string;
  templateId: string;
  templateName: string;
  readiness?: ReadinessLevel;
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

export type ProgramGoal = 'recomp' | 'cut' | 'bulk' | 'strength';

export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;

/** User-selected training program (goal + frequency). Workouts are generated from this. */
export interface ActiveProgram {
  goal: ProgramGoal;
  daysPerWeek: DaysPerWeek;
  title: string;
  startedAt: string;
  /** Template ids in weekly order */
  templateIds: string[];
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  focusModeDefault: boolean;
  defaultRestSeconds: number;
  barbellWeightKg: number;
  unit: 'kg' | 'lbs';
  theme: 'light' | 'dark';
  currentWeek: 'A' | 'B';
  activeProgram?: ActiveProgram | null;
}

export type HapticEvent =
  | 'setComplete'
  | 'copyPrevious'
  | 'timerTick'
  | 'timerDone'
  | 'pr'
  | 'rpeConfirm'
  | 'button';
