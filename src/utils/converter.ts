import { FilterRule } from '../enums/filter-rule.enum'
import { UnprocessableEntityException } from '@nestjs/common'
import { removeDotInJson } from '@frontalnh/json-dot-parser'
import { ruleMappings } from './rule-mappings'
import { FindOptionsWhere } from 'typeorm'

export function converter<TEntity>(param: string) {
  const [property, rule, ...value] = param.split(':')
  const [name, ...nested] = property!.split('.')
  const filterRuleValues = Object.values(FilterRule) as ReadonlyArray<string>
  if (!filterRuleValues.includes(rule!)) {
    throw new UnprocessableEntityException({
      message: 'Validation error',
      data: [
        {
          property: 'where',
          errors: [`where property ${rule} is not allowed`]
        }
      ]
    })
  }

  const filter = {
    property,
    rule: rule as FilterRule,
    value: value.join(':')
  }
  const fullProperty = nested.length ? `${name}.${nested.join('.')}` : name!

  return removeDotInJson(
    ruleMappings[filter.rule](fullProperty, filter.value)
  ) as FindOptionsWhere<TEntity>
}