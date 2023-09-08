import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcriberDto } from './create-subcriber.dto';

export class UpdateSubcriberDto extends PartialType(CreateSubcriberDto) {}
