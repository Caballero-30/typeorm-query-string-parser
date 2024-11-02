/** Enum for filter rule */
export enum FilterRule {
  /** Equals */
  EQUALS = 'eq',
  /** Not equals */
  NOT_EQUALS = 'notEq',
  /** Greater than */
  GREATER_THAN = 'gt',
  /** Greater than or equals */
  GREATER_THAN_OR_EQUALS = 'gte',
  /** Less than */
  LESS_THAN = 'lt',
  /** Less than or equals */
  LESS_THAN_OR_EQUALS = 'lte',
  /** Like */
  LIKE = 'like',
  /** Not like */
  NOT_LIKE = 'notLike',
  /** In */
  IN = 'in',
  /** Not in */
  NOT_IN = 'notIn',
  /** Is null */
  IS_NULL = 'isNull',
  /** Is not */
  IS_NOT_NULL = 'isNotNull',
  /** ILike */
  ILIKE = 'iLike',
  /** Not ILike */
  NOT_ILIKE = 'notILike',
  /** Between */
  BETWEEN = 'between',
  /** Not between */
  NOT_BETWEEN = 'notBetween',
  /** Array contains */
  ARRAY_CONTAINS = 'arrayContains',
  /** Array not contains */
  ARRAY_NOT_CONTAINS = 'arrayNotContains',
  /** JSON contains */
  JSON_CONTAINS = 'jsonContains'
}