import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

// O e-mail é normalizado antes de tudo, inclusive da validação: sem os
// espaços das pontas e em minúsculas (LLD, seção 6.2).
function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail(undefined, { message: 'Informe um e-mail válido.' })
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
