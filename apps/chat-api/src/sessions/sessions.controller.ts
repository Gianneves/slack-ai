// O controller adapta o HTTP (.opencode/rules/nest-api-controller.md):
// recebe a requisição, valida a entrada pelo DTO, chama o service e devolve
// o resultado. Ele não lança erro e não injeta repository.
import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './login-dto.js';
import { SessionsService } from './sessions.service.js';

// Campos do JSON em snake_case (LLD, "Interfaces").
export interface LoginResponse {
  token: string;
  expires_at: string;
  person: {
    id: string;
    email: string;
  };
}

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  // Entrar: "Estados e regras", seção "Sessão e login" (LLD, "Interfaces").
  @Post()
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const result = await this.sessions.login({
      email: body.email,
      password: body.password,
    });

    return {
      token: result.token,
      expires_at: result.expiresAt.toISOString(),
      person: result.person,
    };
  }
}
