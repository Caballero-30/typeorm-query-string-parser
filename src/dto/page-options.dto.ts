import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator'
import { PaginationOrder } from '../enums/pagination-order.enum'
import { Transform } from 'class-transformer'
import { FilterRule } from '../enums/filter-rule.enum'
import { removeDotInJson } from '@frontalnh/json-dot-parser'
import { FindOptionsOrder, FindOptionsRelations, FindOptionsWhere } from 'typeorm'
import { converter } from '../utils/converter'
import { extractEntities } from '../utils/extract-entites'

/** Page options data transfer object. It contains the pagination, sorting, and filtering options */
export class PageOptionsDto<TEntity> {
  private static readonly WHERE_PATTERN = `^([a-zA-Z0-9_,.]+:(?:${Object.values(FilterRule).join('|')}):[^|]+)(\\|([a-zA-Z0-9_,.]+:(?:${Object.values(FilterRule).join('|')}):[^|]+))*$`
  private static readonly SORT_PATTERN = '^([a-zA-Z0-9_,.]+:(ASC|DESC|asc|desc))(,([a-zA-Z0-9_,.]+:(ASC|DESC|asc|desc)))*$'

  /**
   * Page number. It must be an integer greater than `0` and less than `take` value
   * @default 1
   */
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    default: 1
  })
  @Min(1)
  @IsInt()
  @IsOptional()
  readonly page?: number = 1

  /**
   * Number of items per page. It must be an integer between 1 and 50
   * @default 10
   */
  @ApiPropertyOptional({
    type: 'integer',
    minimum: 1,
    maximum: 50,
    default: 10
  })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10

  /**
   * Sort by property and direction. Direction is not case-sensitive
   * @example `id:ASC`
   */
  @ApiPropertyOptional({
    description: 'Sort by property and direction. Direction is not case-sensitive',
    pattern: PageOptionsDto.SORT_PATTERN,
    examples: {
      default: {},
      ascending: {
        value: `id:${PaginationOrder.ASC.toLowerCase()}`
      },
      descending: {
        value: `nested.createdAt:${PaginationOrder.DESC}`
      }
    }
  })
  @Matches(new RegExp(PageOptionsDto.SORT_PATTERN), {
    message: 'each sort parameter must be in the format of field:order',
  })
  @IsString()
  @IsOptional()
  readonly sort?: string

  /**
   * Filter by property, condition, and value. It supports more filters separated by semicolon and different conditions separated by vertical bar
   * @example `id:eq:1|name:like:doe`
   */
  @ApiPropertyOptional({
    description: 'Filter by property, condition, and value. It supports more filters separated by semicolon and different conditions separated by vertical bar',
    pattern: PageOptionsDto.WHERE_PATTERN,
    examples: {
      default: {},
      concatenated: {
        value: `id:${FilterRule.EQUALS}:1|name:${FilterRule.LIKE}:doe`
      },
      [FilterRule.IS_NULL]: {
        value: `id:${FilterRule.IS_NULL}`
      },
      [FilterRule.IS_NOT_NULL]: {
        value: `id:${FilterRule.IS_NOT_NULL}`
      },
      [FilterRule.EQUALS]: {
        value: `id:${FilterRule.EQUALS}:1`
      },
      [FilterRule.NOT_EQUALS]: {
        value: `id:${FilterRule.NOT_EQUALS}:1`
      },
      [FilterRule.GREATER_THAN]: {
        value: `id:${FilterRule.GREATER_THAN}:1`
      },
      [FilterRule.GREATER_THAN_OR_EQUALS]: {
        value: `id:${FilterRule.GREATER_THAN_OR_EQUALS}:1`
      },
      [FilterRule.LESS_THAN]: {
        value: `id:${FilterRule.LESS_THAN}:1`
      },
      [FilterRule.LESS_THAN_OR_EQUALS]: {
        value: `id:${FilterRule.LESS_THAN_OR_EQUALS}:1`
      },
      [FilterRule.LIKE]: {
        value: `name:${FilterRule.LIKE}:doe`
      },
      [FilterRule.NOT_LIKE]: {
        value: `name:${FilterRule.NOT_LIKE}:doe`
      },
      [FilterRule.IN]: {
        value: `id:${FilterRule.IN}:1,2,3`
      },
      [FilterRule.NOT_IN]: {
        value: `id:${FilterRule.NOT_IN}:1,2,3`
      },
      [FilterRule.ILIKE]: {
        value: `name:${FilterRule.ILIKE}:doe`
      },
      [FilterRule.NOT_ILIKE]: {
        value: `name:${FilterRule.NOT_ILIKE}:doe`
      },
      [FilterRule.BETWEEN]: {
        value: `id:${FilterRule.BETWEEN}:1,2`
      },
      [FilterRule.NOT_BETWEEN]: {
        value: `id:${FilterRule.NOT_BETWEEN}:1,2`
      },
      [FilterRule.ARRAY_CONTAINS]: {
        value: `name:${FilterRule.ARRAY_CONTAINS}:doe,foo`
      },
      [FilterRule.ARRAY_NOT_CONTAINS]: {
        value: `name:${FilterRule.ARRAY_NOT_CONTAINS}:doe,foo`
      },
      [FilterRule.JSON_CONTAINS]: {
        value: `data:${FilterRule.JSON_CONTAINS}:{"key":"value"}`
      }
    }
  })
  @Matches(new RegExp(PageOptionsDto.WHERE_PATTERN), {
    message: 'each filter parameter must be in the format of field:rule:value',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => decodeURIComponent(value))
  readonly where?: string

  /** Calculate the number of items to skip */
  get skip() {
    return (this.page! - 1) * this.take!
  }

  /** Get sorting options*/
  get sorting(): FindOptionsOrder<TEntity> {
    if (!this.sort) return {}

    const [property, direction] = this.sort.split(':')
    const [name, ...nested] = property!.split('.')
    const fullProperty = nested.length ? `${name}.${nested.join('.')}` : name!

    return removeDotInJson({
      [fullProperty] : direction
    })
  }

  /** Get filtering options */
  get filter(): Array<FindOptionsWhere<TEntity>> {
    return this.where?.split('|')?.map(it => {
      const [first, ...rest] = it.split(';').filter(cond => cond.length)

      return rest.length
        ? [first!, ...rest].reduce((prev, curr) => {
            return {
              ...prev,
              ...converter(curr)
            }
          }, converter<TEntity>(first!))
        : converter<TEntity>(first!)
    }) || []
  }

  /** Get nested relations */
  get relations(): FindOptionsRelations<TEntity> {
    const sortEntities = extractEntities(this.sort || '')
    const whereEntities = extractEntities(this.where || '')
    const entities = Array.from(new Set([...sortEntities, ...whereEntities]))
    const obj = Object.fromEntries(entities.map(it => [it, true]))

    return removeDotInJson(obj)
  }

  /**
   * Create a new instance of `PageOptionsDto`
   * @param page=1
   * @param take=10
   * @param sort
   * @param where
   */
  constructor(page = 1, take = 10, sort?: string, where?: string) {
    this.page = page
    this.take = take
    this.sort = sort
    this.where = where
  }

  /** Convert to repository options */
  toRepositoryOptions() {
    return {
      where: this.filter,
      order: this.sorting,
      take: this.take!,
      skip: this.skip!,
      relations: this.relations
    }
  }
}