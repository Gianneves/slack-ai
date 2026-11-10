import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Contagem de tentativas de login de um e-mail (ADR 0023). Estados do limite:
// livre (sem linha), contando e bloqueado ("Estados e regras", seção "Sessão
// e login").
@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'integer' })
  failedAttempts!: number;

  // Início da janela: a primeira falha dentro dela.
  @Column({ type: 'timestamptz' })
  firstFailedAt!: Date;

  // Preenchido quando o e-mail está bloqueado.
  @Column({ type: 'timestamptz', nullable: true })
  blockedUntil!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
