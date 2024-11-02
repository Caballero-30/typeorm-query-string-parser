import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsInt } from 'class-validator'
import { UnprocessableEntityException } from '@nestjs/common'
import { PageOptionsDto } from './page-options.dto'

/** Page metadata transfer object. It contains the metadata of the page */
export class PageMetaDto<TEntity> {
  /** Page number */
  @ApiProperty({ type: 'integer' })
  @IsInt()
  readonly page: number

  /** Number of items per page */
  @ApiProperty({ type: 'integer' })
  @IsInt()
  readonly take: number

  /** Total number of items */
  @ApiProperty({ type: 'integer' })
  @IsInt()
  readonly itemCount: number

  /** Total number of pages */
  @ApiProperty({ type: 'integer' })
  @IsInt()
  readonly pageCount: number

  /** Whether there is a previous page */
  @ApiProperty()
  @IsBoolean()
  readonly hasPreviousPage: boolean

  /** Whether there is a next page */
  @ApiProperty()
  @IsBoolean()
  readonly hasNextPage: boolean

  /**
   * Page metadata transfer object constructor
   * @param pageOptionsDto Page options data transfer object
   * @param itemCount Total number of items
   * @throws UnprocessableEntityException If the page is greater than the total number of items or the total number of pages. It contains the validation error:
   * ```typescript
   * {
   *  message: 'Validation error',
   *  data: [
   *   {
   *    "property": "page",
   *    "errors": [
   *     `page must be less than or equal to ${this.pageCount}`
   *    ]
   *   }
   *  ]
   * }
   * ```
   */
  constructor(pageOptionsDto: PageOptionsDto<TEntity>, itemCount: number) {
    this.page = pageOptionsDto.page!
    this.take = pageOptionsDto.take!
    this.itemCount = itemCount
    this.pageCount = Math.ceil(itemCount / pageOptionsDto.take!)
    this.hasPreviousPage = this.page > 1
    this.hasNextPage = this.page < this.pageCount

    if (![0, 1].includes(itemCount) && (this.page > itemCount || this.page > this.pageCount)) {
      throw new UnprocessableEntityException({
        message: 'Validation error',
        data: [
          {
            property: 'page',
            errors: [`page must be less than or equal to ${this.pageCount}`]
          }
        ]
      })
    }
  }
}