export function extractEntities(input: string) {
  return input.split(/[|;]/).map(it => {
    const [field] = it.split(':')
    const parts = field!.split('.')

    return parts.slice(0, -1).join('.')
  }).filter(Boolean)
}