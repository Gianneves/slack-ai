import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Pessoa do chat. É assim que o e-mail é gravado, normalizado
// (LLD, "Estados e regras", "Sessão e login").
@Entity('people')
export class Person {
  // Id em UUID v7, gerado na aplicação (ADR 0022).
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  passwordHash!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
