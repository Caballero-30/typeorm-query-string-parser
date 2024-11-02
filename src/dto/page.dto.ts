import { IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { PageMetaDto } from './page-meta.dto'

/** Page data transfer object. It contains the result and metadata */
export class PageDto<TEntity> {
  /** Page result data */
  @ApiProperty({ isArray: true })
  @IsArray()
  readonly result: ReadonlyArray<TEntity>

  /** Page meta data */
  @ApiProperty({ type: PageMetaDto<TEntity> })
  readonly meta: PageMetaDto<TEntity>

  constructor(result: ReadonlyArray<TEntity>, meta: PageMetaDto<TEntity>) {
    this.result = result
    this.meta = meta
  }
}