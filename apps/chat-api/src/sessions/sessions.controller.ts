// O controller adapta o HTTP (.opencode/rules/nest-api-controller.md):
// recebe a requisição, valida a entrada pelo DTO, chama o service e devolve
// o resultado. Ele não lança erro e não injeta repository.
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import type { AuthenticatedRequest } from './auth.guard.js';
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

export interface CurrentSessionResponse {
  person: {
    id: string;
    name: string;
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

  // Verificar a Sessão apresentada: o guard já resolveu a Pessoa
  // (LLD, "Interfaces"; "Estados e regras", seção 6.2).
  @Get('current')
  @UseGuards(AuthGuard)
  current(@Req() request: AuthenticatedRequest): CurrentSessionResponse {
    return { person: request.person };
  }

  // Sair da Sessão apresentada: o guard já resolveu a Sessão.
  @Delete('current')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.sessions.logout({ sessionId: request.session.id });
  }
}
