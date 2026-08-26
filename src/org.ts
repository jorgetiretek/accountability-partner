export interface OrgPosition { id:string; name:string; area?:string; reportsToPositionId?:string }
export interface OrgPerson { id:string; name:string; active:boolean }
export interface OrgPlacement { id:string; personId:string; positionId:string; managerPersonId?:string }
export interface Organization { positions:OrgPosition[]; people:OrgPerson[]; placements:OrgPlacement[] }

export const emptyOrganization:Organization={positions:[],people:[],placements:[]};
export const normalizeOrganization=(value:unknown):Organization=>{
 const data=value as Partial<Organization>|null;
 return {positions:Array.isArray(data?.positions)?data.positions:[],people:Array.isArray(data?.people)?data.people:[],placements:Array.isArray(data?.placements)?data.placements:[]};
};
export const personName=(org:Organization,id?:string,fallback?:string)=>org.people.find(person=>person.id===id)?.name||fallback||'Sin asignar';
export const positionsFor=(org:Organization,personId:string)=>org.placements.filter(placement=>placement.personId===personId).map(placement=>org.positions.find(position=>position.id===placement.positionId)?.name).filter(Boolean) as string[];
