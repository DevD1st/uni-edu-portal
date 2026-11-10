import { Query } from '@nestjs/cqrs';
import type { AcademicReferencesResponseDto } from '../dtos/academic-references-response.dto.js';

export class GetAcademicReferencesQuery extends Query<AcademicReferencesResponseDto> {}
