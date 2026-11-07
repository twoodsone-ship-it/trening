export type MuscleCategory = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';

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
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  completed: boolean;
  isWarmup?: boolean;
  type?: WorkoutSetType;
}

export interface SetHistoryEntry {
  setNumber: number;
  weight: number;
  reps: number;
  durationSeconds?: number;
  distanceMeters?: number;
  rpe?: number;
  completed?: boolean;
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
  phase?: 'deload';
  decision?: ProgressionDecision;
  totalVolume: number;
  totalDurationSeconds?: number;
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
  trackingMode?: 'reps' | 'duration' | 'distance';
  defaultDurationSeconds?: number;
  cardioIntensity?: 'easy' | 'moderate' | 'intervals';
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
  /** Compact history for in-workout progress chart */
  historySessions?: { date: string; weight: number; totalVolume: number; totalDurationSeconds?: number }[];
  trackingMode?: 'reps' | 'duration' | 'distance';
  defaultDurationSeconds?: number;
  cardioIntensity?: 'easy' | 'moderate' | 'intervals';
}

export interface ActiveWorkout {
  templateId: string;
  templateName: string;
  readiness?: ReadinessLevel;
  startTime: number;
  cycleWeek?: number;
  cyclePhase?: 'base' | 'progress' | 'overload' | 'deload';
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
  totalCardioSeconds?: number;
  cycleWeek?: number;
  cyclePhase?: 'base' | 'progress' | 'overload' | 'deload';
  exercises: {
    exerciseId: string;
    name: string;
    category: MuscleCategory;
    targetSets: number;
    minReps: number;
    maxReps: number;
    workingWeight: number;
    trackingMode?: 'reps' | 'duration' | 'distance';
    sets: SetHistoryEntry[];
    progression: ProgressionRecommendation;
  }[];
}

export type ProgramGoal = 'recomp' | 'cut' | 'bulk' | 'strength';

export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;

/** What gear the athlete has available when generating a program */
export type GymProfile = 'full' | 'dumbbells' | 'home';

/** User-selected training program (goal + frequency). Workouts are generated from this. */
export interface ActiveProgram {
  goal: ProgramGoal;
  daysPerWeek: DaysPerWeek;
  gymProfile: GymProfile;
  title: string;
  startedAt: string;
  /** Template ids in weekly order */
  templateIds: string[];
  /** Planned direct core sessions in each weekly split. */
  coreSessionsPerWeek?: 0 | 1 | 2 | 3 | 4;
  /** Planned cardio finishers; zero disables generated cardio. */
  cardioSessionsPerWeek?: number;
}

export interface ProgramAdaptationAdvice {
  id: string;
  severity: 'info' | 'warning';
  title: string;
  message: string;
  suggestedDaysPerWeek?: DaysPerWeek;
  actionLabel: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  voiceEnabled: boolean;
  focusModeDefault: boolean;
  defaultRestSeconds: number;
  barbellWeightKg: number;
  /** @deprecated The interface currently supports kilograms only. */
  unit: 'kg' | 'lbs';
  lastBackupAt?: number;
  reminderDismissedAt?: number;
  /** @deprecated The interface currently supports the dark theme only. */
  theme: 'light' | 'dark';
  currentWeek: 'A' | 'B';
  activeProgram?: ActiveProgram | null;
  gymProfile?: GymProfile;
}

export type HapticEvent =
  | 'setComplete'
  | 'copyPrevious'
  | 'timerTick'
  | 'timerDone'
  | 'pr'
  | 'rpeConfirm'
  | 'button';
