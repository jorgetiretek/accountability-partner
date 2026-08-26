export type Status = 'INBOX' | 'NEXT' | 'ACTIVE' | 'BLOCKED' | 'SOMEDAY' | 'DONE' | 'CANCELLED' | 'WAITING';
export type Priority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type Kind = 'TASK' | 'PROJECT' | 'FOLLOW_UP' | 'MEETING' | 'DECISION' | 'IDEA';
export type Visibility = 'PERSONAL' | 'SHARED' | 'COACH_ASSIGNED';
export type CommitmentRole = 'EXECUTE' | 'AUTHORIZE' | 'SUPERVISE' | 'RECEIVE';
export type GameRole = 'QUARTERBACK' | 'EXECUTOR' | 'REFEREE' | 'COACH';
export type BlockerCategory = 'PERSONAS' | 'DINERO' | 'DECISION' | 'INFORMACION' | 'PROVEEDOR' | 'HERRAMIENTA' | 'OTRO';
export type ReplanReason = 'DEPENDENCIA' | 'INFORMACION' | 'RECURSOS' | 'AUSENCIA' | 'FALLA' | 'PRIORIDAD' | 'MALA_ESTIMACION' | 'OTRA';
export type LifeArea = 'MISSION' | 'LEARNING' | 'HEALTH' | 'FAMILY' | 'INNER';

export const areaLabels: Record<LifeArea, string> = {
  MISSION: 'Profesional, negocio y libertad financiera', LEARNING: 'Aprendizaje y formación',
  HEALTH: 'Salud y energía', FAMILY: 'Relaciones y familia', INNER: 'Bienestar, propósito y espiritualidad',
};
export const gameRoleLabels: Record<GameRole, string> = {
  QUARTERBACK: 'Quarterback', EXECUTOR: 'Executor', REFEREE: 'Referee', COACH: 'DT / Coach',
};
export const blockerLabels: Record<BlockerCategory, string> = {
  PERSONAS: 'Falta de personas o capacidad', DINERO: 'Falta de dinero o presupuesto', DECISION: 'Falta una decisión o autorización',
  INFORMACION: 'Falta información', PROVEEDOR: 'Dependencia de proveedor', HERRAMIENTA: 'Herramienta o sistema', OTRO: 'Otro',
};
export const replanReasonLabels: Record<ReplanReason, string> = {
  DEPENDENCIA: 'Dependencia no entregada', INFORMACION: 'Falta de información', RECURSOS: 'Falta de recursos o dinero',
  AUSENCIA: 'Enfermedad, vacaciones o ausencia', FALLA: 'Falla técnica u operativa', PRIORIDAD: 'Cambio de prioridad',
  MALA_ESTIMACION: 'Mala estimación u olvido', OTRA: 'Otra razón',
};

export interface Event { id: string; at: string; action: string; note?: string }
export interface Item {
  id: string; title: string; kind: Kind; status: Status; priority: Priority; area: LifeArea;
  visibility?: Visibility; commitmentRole?: CommitmentRole; gameRole?: GameRole; role?: string;
  dueDate?: string; originalDueDate?: string; reviewDate?: string; meetingAt?: string;
  participants?: string; meetingScore?: number; nextAction?: string; person?: string; blocker?: string;
  directManager?: string; blockerCategory?: BlockerCategory; escalatedTo?: string; escalatedAt?: string;
  escalationMethod?: string; escalationMessage?: string; requestedSupport?: string; escalationReviewDate?: string;
  requestedDueDate?: string; replanRequestedAt?: string; replanReason?: ReplanReason; replanNote?: string;
  replanNotifiedTo?: string; replanMethod?: string; replanImpact?: string; replanStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  progress?: number; startedAt?: string; events: Event[]; createdAt: string; updatedAt: string;
}
export type Timing = 'ON_TIME' | 'RISK_INFORMED' | 'OVERDUE_UNATTENDED' | 'LATE_REPLAN' | 'OVERDUE_TRACKED';
export const timingLabels: Record<Timing, string> = {
  ON_TIME: 'En tiempo', RISK_INFORMED: 'Riesgo informado', OVERDUE_UNATTENDED: 'Vencido sin atención',
  LATE_REPLAN: 'Regularización tardía', OVERDUE_TRACKED: 'Vencido con seguimiento',
};
export const active = (items: Item[]) => items.filter(i => i.status === 'ACTIVE').sort((a,b) => a.updatedAt.localeCompare(b.updatedAt));
export const overdue = (item: Item, today = new Date().toISOString().slice(0,10)) => Boolean(item.dueDate && item.dueDate < today && !['DONE','CANCELLED'].includes(item.status));
export function timing(item: Item, today = new Date().toISOString().slice(0,10)): Timing {
  if (!item.dueDate || ['DONE','CANCELLED'].includes(item.status)) return 'ON_TIME';
  const requestedAt = item.replanRequestedAt?.slice(0,10);
  const original = item.originalDueDate || item.dueDate;
  if (item.replanStatus === 'PENDING' || item.replanStatus === 'APPROVED') {
    if (requestedAt && requestedAt > original) return 'LATE_REPLAN';
    if (requestedAt && requestedAt <= original && item.dueDate >= today) return 'RISK_INFORMED';
  }
  if (item.dueDate < today) return item.events.some(e => e.action === 'Avance registrado') ? 'OVERDUE_TRACKED' : 'OVERDUE_UNATTENDED';
  return 'ON_TIME';
}
export function recommendation(items: Item[]): Item | undefined { const candidates = items.filter(i => i.status === 'ACTIVE' || i.status === 'NEXT'); return candidates.sort((a,b) => Number(overdue(b)) - Number(overdue(a)) || rank(b.priority)-rank(a.priority) || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))[0]; }
const rank = (p: Priority) => ({ CRITICAL:4, HIGH:3, NORMAL:2, LOW:1 })[p];
export function canStart(items: Item[], item: Item) { return item.nextAction?.trim() ? active(items).filter(i => i.id !== item.id).length < 3 : false; }
