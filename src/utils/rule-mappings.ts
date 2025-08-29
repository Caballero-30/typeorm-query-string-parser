import { FilterRule } from '../enums/filter-rule.enum'
import {
  ArrayContains,
  Between,
  Equal,
  FindOperator,
  ILike,
  In,
  IsNull,
  JsonContains,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not
} from 'typeorm'

export const ruleMappings: Record<FilterRule, (prop: string, value: string) => Record<string, FindOperator<string>>> = {
  [FilterRule.EQUALS]: (prop, value) => {
    return {
      [prop]: Equal(value)
    }
  },
  [FilterRule.NOT_EQUALS]: (prop, value) => {
    return {
      [prop]: Not(Equal(value))
    }
  },
  [FilterRule.GREATER_THAN]: (prop, value) => {
    return {
      [prop]: MoreThan(value)
    }
  },
  [FilterRule.GREATER_THAN_OR_EQUALS]: (prop, value) => {
    return {
      [prop]: MoreThanOrEqual(value)
    }
  },
  [FilterRule.LESS_THAN]: (prop, value) => {
    return {
      [prop]: LessThan(value)
    }
  },
  [FilterRule.LESS_THAN_OR_EQUALS]: (prop, value) => {
    return {
      [prop]: LessThanOrEqual(value)
    }
  },
  [FilterRule.LIKE]: (prop, value) => {
    return {
      [prop]: Like(`%${value}%`)
    }
  },
  [FilterRule.NOT_LIKE]: (prop, value) => {
    return {
      [prop]: Not(Like(`%${value}%`))
    }
  },
  [FilterRule.IN]: (prop, value) => {
    return {
      [prop]: In(value!.split(','))
    }
  },
  [FilterRule.NOT_IN]: (prop, value) => {
    return {
      [prop]: Not(In(value!.split(',')))
    }
  },
  [FilterRule.IS_NULL]: prop => {
    return {
      [prop]: IsNull()
    }
  },
  [FilterRule.IS_NOT_NULL]: prop => {
    return {
      [prop]: Not(IsNull())
    }
  },
  [FilterRule.ILIKE]: (prop, value) => {
    return {
      [prop]: ILike(`%${value}%`)
    }
  },
  [FilterRule.NOT_ILIKE]: (prop, value) => {
    return {
      [prop]: Not(ILike(`%${value}%`))
    }
  },
  [FilterRule.BETWEEN]: (prop, value) => {
    const [min, max] = value!.split(',')
    return {
      [prop]: Between(min!, max!)
    }
  },
  [FilterRule.NOT_BETWEEN]: (prop, value) => {
    const [min, max] = value!.split(',')
    return {
      [prop]: Not(Between(min!, max!))
    }
  },
  [FilterRule.ARRAY_CONTAINS]: (prop, value) => {
    return {
      [prop]: ArrayContains(value.split(','))
    }
  },
  [FilterRule.ARRAY_NOT_CONTAINS]: (prop, value) => {
    return {
      [prop]: Not(ArrayContains(value.split(',')))
    }
  },
  [FilterRule.JSON_CONTAINS]: (prop, value) => {
    return {
      [prop]: JsonContains(JSON.parse(value))
    }
  }
}