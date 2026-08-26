import { describe, expect, it } from 'vitest';
import { active, canStart, Item, overdue, recommendation } from './domain';
const item=(id:string, status:Item['status'], extra:Partial<Item>={}):Item=>({id,title:id,status,kind:'TASK',priority:'NORMAL',area:'BUSINESS',events:[],createdAt:'2026-08-01T00:00:00Z',updatedAt:'2026-08-01T00:00:00Z',...extra});
describe('reglas del carril',()=>{
 it('limita el trabajo activo a tres asuntos',()=>{const list=[item('1','ACTIVE'),item('2','ACTIVE'),item('3','ACTIVE'),item('4','NEXT',{nextAction:'Llamar'} )];expect(active(list)).toHaveLength(3);expect(canStart(list,list[3])).toBe(false);});
 it('exige siguiente acción antes de iniciar',()=>expect(canStart([],item('x','NEXT'))).toBe(false));
 it('detecta vencimientos y recomienda el crítico vencido',()=>{const later=item('later','ACTIVE',{priority:'HIGH',dueDate:'2026-08-20'});const critical=item('urgent','NEXT',{priority:'CRITICAL',dueDate:'2026-08-10'});expect(overdue(critical,'2026-08-16')).toBe(true);expect(recommendation([later,critical])?.id).toBe('urgent');});
});
