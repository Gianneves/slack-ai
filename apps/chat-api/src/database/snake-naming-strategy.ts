import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

// Nomes do código para snake_case no banco (LLD, "Dados", convenções).
export function toSnakeCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName?: string): string {
    return customName ?? toSnakeCase(className);
  }

  columnName(
    propertyName: string,
    customName?: string,
    embeddedPrefixes: ReadonlyArray<string> = [],
  ): string {
    const prefixes = embeddedPrefixes.map((prefix) => `${toSnakeCase(prefix)}_`).join('');
    return prefixes + (customName ?? toSnakeCase(propertyName));
  }
}
