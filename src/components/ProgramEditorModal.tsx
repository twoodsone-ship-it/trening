import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Plus, Search, Trash2, X } from 'lucide-react';
import type { ActiveProgram, Exercise, GymProfile, ProgramGoal, WorkoutTemplate } from '../types';
import { EXERCISE_CATALOG, type CatalogExerciseItem } from '../data/exerciseCatalog';
import { applyAccessorySchedule } from '../data/programBuilder';
import { isEquipmentAllowed } from '../utils/equipmentMap';
import { cn } from '../utils/cn';

interface ProgramEditorModalProps {
  isOpen: boolean;
  templates: WorkoutTemplate[];
  program: ActiveProgram;
  onClose: () => void;
  onSave: (templates: WorkoutTemplate[], program: ActiveProgram) => void;
}

function toExercise(item: CatalogExerciseItem, previous?: Exercise): Exercise {
  if (previous?.id === item.id) return { ...previous };
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    equipment: item.equipment,
    animationType: item.animationType,
    gifUrl: item.gifUrl,
    technique: item.technique,
    alternatives: item.alternatives,
    targetSets: item.defaultSets,
    minReps: item.minReps,
    maxReps: item.maxReps,
    weightStep: item.weightStep,
    currentWeight: item.defaultWeight,
    restSeconds: item.restSeconds,
    trackingMode: item.trackingMode || 'reps',
    defaultDurationSeconds: item.defaultDurationSeconds,
    cardioIntensity: item.cardioIntensity,
    history: []
  };
}

export const ProgramEditorModal: React.FC<ProgramEditorModalProps> = ({
  isOpen,
  templates,
  program,
  onClose,
  onSave
}) => {
  const [draft, setDraft] = useState(templates);
  const [programDraft, setProgramDraft] = useState(program);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [picker, setPicker] = useState<{ kind: 'add' } | { kind: 'replace'; index: number } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDraft(templates.map(t => ({ ...t, exercises: t.exercises.map(ex => ({ ...ex, history: [...ex.history] })) })));
    setProgramDraft({ ...program });
    setSelectedTemplateId(templates[0]?.id || '');
    setPicker(null);
    setSearch('');
  }, [isOpen, templates, program]);

  const selected = draft.find(t => t.id === selectedTemplateId) || draft[0];
  const catalogItems = useMemo(() => Object.values(EXERCISE_CATALOG)
    .filter(item => isEquipmentAllowed(item.equipment, programDraft.gymProfile || 'full'))
    .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 45), [programDraft.gymProfile, search]);

  if (!isOpen || !selected) return null;

  const updateSelected = (transform: (template: WorkoutTemplate) => WorkoutTemplate) => {
    setDraft(current => current.map(t => t.id === selected.id ? transform(t) : t));
  };

  const updateExercise = (index: number, transform: (exercise: Exercise) => Exercise) => {
    updateSelected(t => ({ ...t, exercises: t.exercises.map((ex, i) => i === index ? transform(ex) : ex) }));
  };

  const pickExercise = (item: CatalogExerciseItem) => {
    if (!picker) return;
    const existingAcrossProgram = draft.flatMap(t => t.exercises).find(ex => ex.id === item.id);
    const exercise = toExercise(item, existingAcrossProgram);
    updateSelected(t => ({
      ...t,
      exercises: picker.kind === 'add'
        ? [...t.exercises, exercise]
        : t.exercises.map((ex, i) => i === picker.index ? { ...exercise, supersetGroupId: ex.supersetGroupId } : ex)
    }));
    setPicker(null);
    setSearch('');
  };

  const commit = () => {
    const accessoryChanged =
      (programDraft.coreSessionsPerWeek ?? 2) !== (program.coreSessionsPerWeek ?? 2) ||
      (programDraft.cardioSessionsPerWeek ?? 0) !== (program.cardioSessionsPerWeek ?? 0);
    const finalTemplates = accessoryChanged
      ? applyAccessorySchedule(
          draft,
          programDraft.goal as ProgramGoal,
          programDraft.gymProfile || 'full' as GymProfile,
          programDraft.coreSessionsPerWeek ?? 2,
          programDraft.cardioSessionsPerWeek ?? 0
        )
      : draft;
    onSave(finalTemplates, { ...programDraft, templateIds: finalTemplates.map(t => t.id) });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-ink/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 text-white">
      <div className="w-full max-w-xl h-[100dvh] sm:h-[min(92dvh,850px)] bg-app-atmosphere border border-white/10 sm:rounded-3xl flex flex-col overflow-hidden">
        <header className="shrink-0 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-lime">Редактор</p>
            <h2 className="font-bold truncate">{program.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center" aria-label="Закрыть"><X /></button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {draft.map((t, i) => (
              <button key={t.id} type="button" onClick={() => setSelectedTemplateId(t.id)}
                className={cn('shrink-0 px-3 py-2 rounded-xl border text-xs font-bold', t.id === selected.id ? 'bg-lime text-ink border-lime' : 'bg-white/5 border-white/10 text-muted')}>
                День {i + 1} · {t.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted">Тренировки запускаются по очереди. Следующий день откроется после завершения текущего, независимо от дня недели.</p>

          <section className="surface-panel p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div><p className="font-bold">Пресс / кор</p><p className="text-[11px] text-muted">Сессий в неделю</p></div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(n => <button key={n} type="button" onClick={() => setProgramDraft(p => ({ ...p, coreSessionsPerWeek: n as 0 | 1 | 2 | 3 | 4 }))}
                  className={cn('min-w-9 min-h-9 rounded-lg text-xs font-bold border', (programDraft.coreSessionsPerWeek ?? 2) === n ? 'bg-lime text-ink border-lime' : 'border-white/10 text-muted')}>{n}</button>)}
              </div>
            </div>
              <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <div><p className="font-bold">Кардио</p><p className="text-[11px] text-muted">Сессий в неделю</p></div>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, programDraft.daysPerWeek) + 1 }, (_, n) => n).map(n => <button key={n} type="button" onClick={() => setProgramDraft(p => ({ ...p, cardioSessionsPerWeek: n }))}
                    className={cn('min-w-9 min-h-9 rounded-lg text-xs font-bold border', (programDraft.cardioSessionsPerWeek || 0) === n ? 'bg-lime text-ink border-lime' : 'border-white/10 text-muted')}>{n}</button>)}
                </div>
              </div>
            <p className="text-[10px] text-muted">Если изменить частоту, выбранные аксессуары будут равномерно переставлены по неделе.</p>
          </section>

          <section className="space-y-2">
            {selected.exercises.map((ex, index) => (
              <div key={`${ex.id}-${index}`} className="surface-panel p-3 flex items-center gap-2">
                <div className="flex flex-col">
                  <button type="button" onClick={() => index > 0 && updateSelected(t => { const a = [...t.exercises]; [a[index - 1], a[index]] = [a[index], a[index - 1]]; return { ...t, exercises: a }; })} className="p-1 text-muted" aria-label="Выше"><ArrowUp className="w-4 h-4" /></button>
                  <button type="button" onClick={() => index < selected.exercises.length - 1 && updateSelected(t => { const a = [...t.exercises]; [a[index + 1], a[index]] = [a[index], a[index + 1]]; return { ...t, exercises: a }; })} className="p-1 text-muted" aria-label="Ниже"><ArrowDown className="w-4 h-4" /></button>
                </div>
                <div className="min-w-0 flex-1"><p className="text-[10px] uppercase text-muted">{ex.category}</p><p className="font-semibold text-sm truncate">{ex.name}</p></div>
                <button type="button" onClick={() => { setPicker({ kind: 'replace', index }); setSearch(''); }} className="px-2.5 py-2 min-h-[40px] rounded-lg bg-white/5 text-xs font-semibold">Заменить</button>
                <button type="button" onClick={() => updateSelected(t => ({ ...t, exercises: t.exercises.filter((_, i) => i !== index) }))} className="p-2 text-rose-300" aria-label="Убрать"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </section>

          {picker ? (
            <section className="surface-panel p-3 space-y-2">
              <div className="flex items-center justify-between"><p className="font-bold text-sm">Выбери упражнение</p><button onClick={() => setPicker(null)} className="p-2 text-muted" aria-label="Закрыть каталог"><X className="w-4 h-4" /></button></div>
              <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-muted" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск" className="w-full min-h-[44px] bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 text-sm" /></div>
              <div className="max-h-56 overflow-y-auto space-y-1">
                {catalogItems.map(item => <button key={item.id} type="button" onClick={() => pickExercise(item)} className="w-full min-h-[44px] text-left px-3 py-2 rounded-xl hover:bg-lime/10 flex items-center justify-between gap-2"><span className="text-sm truncate">{item.name}</span><Plus className="w-4 h-4 text-lime shrink-0" /></button>)}
              </div>
            </section>
          ) : (
            <button type="button" onClick={() => setPicker({ kind: 'add' })} className="w-full min-h-[48px] border border-dashed border-white/20 rounded-2xl text-sm font-semibold text-lime flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Добавить упражнение</button>
          )}
        </div>

        <footer className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-ink/95">
          <button type="button" onClick={commit} className="w-full btn-lime min-h-[54px] rounded-2xl font-bold flex items-center justify-center gap-2"><Check className="w-5 h-5" />Сохранить программу</button>
        </footer>
      </div>
    </div>
  );
};
