export type Status = 'INBOX' | 'NEXT' | 'ACTIVE' | 'BLOCKED' | 'SOMEDAY' | 'DONE' | 'CANCELLED' | 'WAITING';
export type Priority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type Kind = 'TASK' | 'PROJECT' | 'FOLLOW_UP' | 'DECISION' | 'IDEA';
export interface Event { id: string; at: string; action: string; note?: string }
export interface Item { id: string; title: string; kind: Kind; status: Status; priority: Priority; role?: string; dueDate?: string; reviewDate?: string; nextAction?: string; person?: string; blocker?: string; progress?: number; events: Event[]; createdAt: string; updatedAt: string; }
export const active = (items: Item[]) => items.filter(i => i.status === 'ACTIVE').sort((a,b) => a.updatedAt.localeCompare(b.updatedAt));
export const overdue = (item: Item, today = new Date().toISOString().slice(0,10)) => Boolean(item.dueDate && item.dueDate < today && !['DONE','CANCELLED'].includes(item.status));
export function recommendation(items: Item[]): Item | undefined { const candidates = items.filter(i => i.status === 'ACTIVE' || i.status === 'NEXT'); return candidates.sort((a,b) => Number(overdue(b)) - Number(overdue(a)) || rank(b.priority)-rank(a.priority) || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))[0]; }
const rank = (p: Priority) => ({ CRITICAL:4, HIGH:3, NORMAL:2, LOW:1 })[p];
export function canStart(items: Item[], item: Item) { return item.nextAction?.trim() ? active(items).filter(i => i.id !== item.id).length < 3 : false; }
