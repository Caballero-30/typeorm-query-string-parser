# TypeORM Query String Parser

This package converts URL query strings into option objects compatible with TypeORM’s `find` and `findAndCount` functions, supporting filtering, pagination, sorting, and relations with custom syntax for NestJS applications.

## Installation

```bash
npm install typeorm-query-string-parser
```

## Usage in a NestJS Service and Controller

### Example Usage in a Service

In the service, you can utilise the `PageOptionsDto` to handle query options with `findAndCount`. Here’s an example using `PageMetaDto` and `PageDto` to handle pagination details:

```typescript
import { Injectable } from '@nestjs/common'
import { PageOptionsDto, PageMetaDto, PageDto } from 'typeorm-query-string-parser'
import { Entity } from './entity.entity'
import { EntityRepository } from './entity.repository'

@Injectable()
export class EntityService {
  constructor(private entityRepository: EntityRepository<Entity>) {}

  async getPaginated(options: PageOptionsDto<Entity>) {
    const [items, count] = await this.entityRepository.findAndCount(options.toRepositoryOptions())
    const pageMetaDto = new PageMetaDto(options, count)

    return new PageDto(items, pageMetaDto)
  }
}
```

In this example:
- `PageOptionsDto<Entity>` processes query parameters and converts them into TypeORM-compatible options.
- `toRepositoryOptions()` is used to transform `PageOptionsDto` into repository options that `findAndCount` can use directly.
- `PageMetaDto` and `PageDto` work together to structure the paginated response. All DTOs, including `PageOptionsDto`, are part of the library and **include** Swagger decorators for automatic API documentation generation.

### Example Usage in a Controller

You can use `PageOptionsDto` as a generic DTO within your NestJS application controller. For example, if you have a TypeORM entity called `Entity`:

```typescript
import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { EntityService } from './entity.service'
import { PageOptionsDto } from 'typeorm-query-string-parser'
import { Entity } from './entity.entity'

@Controller('entities')
export class EntityController {
  constructor(private entityService: EntityService) {}

  @Get('paginated')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPaginated(@Query() options: PageOptionsDto<Entity>) {
    return this.entityService.getPaginated(options)
  }
}
```

### Parameter Structure

Calling the endpoint with a URL like:

```
{baseUrl}/entities/paginated?page=2&take=5&where=nested.name:in:John,Jane;lastName:iLike:doe|firstName:iLike:jan;age:gte:30&sort=nested.createdAt:DESC
```

`PageOptionsDto` will transform the query string into:

```typescript
{
    where: [
      {
        nested: {
          name: In(['John', 'Jane']),
        },
        lastName: ILike('%doe%')
      },
      {
        firstName: ILike('%jan%'),
        age: MoreThanOrEqual('30')
      }
    ],
    order: {
      nested: {
        createdAt: 'DESC'
      }
    },
    take: 5,
    skip: 5,
    relations: {
      nested: true
    }
}
```

### Supported Parameters

- **`page`**: Page number, calculates `skip` value for pagination.
- **`take`**: Record limit per page.
- **`where`**: Filter conditions in the format `field:operator:value`.
    - Operators are defined in the `FilterRule` enum:
        - `eq`, `notEq`, `gt`, `gte`, `lt`, `lte`, `like`, `notLike`, `in`, `notIn`, `isNull`, `isNotNull`, `iLike`, `notILike`, `between`, `notBetween`, `arrayContains`, `arrayNotContains`, `jsonContains`.
    - Multiple filters can be combined using:
        - **Semicolon (;)** for conjunction (AND).
        - **Vertical bar (|)** for disjunction (OR).
        - You can send filters in a nested manner, allowing for combinations like:
            - `{baseUrl}/entities/paginated?page=2&take=5&where=nested.name:in:John,Jane;lastName:iLike:doe|firstName:iLike:jan;age:gte:30`.
- **`sort`**: Sort parameters in the format `field:order`, with values defined in the `PaginationOrder` enum, which is case-insensitive (`ASC`, `DESC`).
