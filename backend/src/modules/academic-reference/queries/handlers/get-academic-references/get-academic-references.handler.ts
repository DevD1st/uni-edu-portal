import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { AcademicLevel } from '../../../entity/academic-levels.entity.js';
import { Faculty } from '../../../entity/faculties.entity.js';
import { Department } from '../../../entity/departments.entity.js';
import { CourseOfStudy } from '../../../entity/courses-of-study.entity.js';
import { GetAcademicReferencesQuery } from '../../impl.js';
import type { AcademicReferencesResponseDto } from '../../../dtos/academic-references-response.dto.js';

const families = {
  undergrad: 'Undergraduate',
  postgrad: 'Postgraduate',
  masters: 'Master’s',
  doctorate: 'Doctorate',
};

@QueryHandler(GetAcademicReferencesQuery)
export class GetAcademicReferencesHandler
  implements IQueryHandler<GetAcademicReferencesQuery>
{
  constructor(private readonly database: DataSource) {}

  async execute(): Promise<AcademicReferencesResponseDto> {
    const [levels, faculties, departments, programmes] = await Promise.all([
      this.database.getRepository(AcademicLevel).findBy({ status: 'active' }),
      this.database
        .getRepository(Faculty)
        .find({ where: { status: 'active' }, order: { name: 'ASC' } }),
      this.database
        .getRepository(Department)
        .find({ where: { status: 'active' }, order: { name: 'ASC' } }),
      this.database
        .getRepository(CourseOfStudy)
        .find({ where: { status: 'active' }, order: { name: 'ASC' } }),
    ]);
    const activeFaculties = new Set(faculties.map(({ id }) => id));
    const activeDepartments = departments.filter(({ facultyId }) =>
      activeFaculties.has(facultyId),
    );
    const activeDepartmentIds = new Set(activeDepartments.map(({ id }) => id));
    return {
      levels: levels
        .sort(
          (left, right) =>
            left.programType.localeCompare(right.programType) ||
            (left.stage || 7) - (right.stage || 7),
        )
        .map(({ id, programType, stage, displayName }) => ({
          id,
          programType,
          stage,
          displayName,
          isGraduate: stage === 0,
          selectionLabel:
            stage === 0
              ? families[programType] + ' · ' + displayName
              : displayName,
        })),
      faculties: faculties.map(({ id, name }) => ({ id, name })),
      departments: activeDepartments.map(({ id, facultyId, name }) => ({
        id,
        facultyId,
        name,
      })),
      programmes: programmes
        .filter(({ departmentId }) => activeDepartmentIds.has(departmentId))
        .map(({ id, departmentId, programType, name }) => ({
          id,
          departmentId,
          programType,
          name,
        })),
    };
  }
}
