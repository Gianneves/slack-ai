import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Sessão de uma pessoa. O banco guarda só o SHA-256 do token, entregue uma
// só vez ao BFF (LLD, "Conceitos transversais de implementação", "Segurança").
@Entity('sessions')
export class Session {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'person_id', type: 'uuid' })
  personId!: string;

  @Index({ unique: true })
  @Column({ type: 'char', length: 64 })
  tokenHash!: string;

  @Column({ type: 'timestamptz' })
  lastUsedAt!: Date;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
