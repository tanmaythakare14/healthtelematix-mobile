import type { CarePlanDTO, CarePlanListItem } from '../@types';

export function carePlanDTOToListItem(dto: CarePlanDTO): CarePlanListItem {
  return {
    id: dto.id,
    name: dto.name,
    conditionName: dto.conditionName,
    enrolledProgram: dto.enrolledProgram,
    shortDescription: dto.shortDescription,
    status: dto.status,
    progress: dto.progress,
    lastUpdated: dto.lastUpdated,
    completedOn: dto.completedOn,
    assignedBy: dto.assignedBy,
  };
}
