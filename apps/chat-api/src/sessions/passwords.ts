// Hash Argon2id da senha guardado no banco (LLD, "Segurança").
import { hash, verify } from '@node-rs/argon2';

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain);
}

export async function isPasswordRight(plain: string, argon2Hash: string): Promise<boolean> {
  return verify(argon2Hash, plain);
}

// Hash fictício (LLD, "Segurança"): quando o e-mail não tem conta, o login
// verifica a senha contra ele, para o tempo de resposta não revelar se a
// conta existe. É a senha "senha-fake" sob Argon2id; pessoas de teste nunca
// têm essa senha.
export const FAKE_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$se3gDEhimanih8OgywMrSg$N7pSaWP+iW3UPbNRUAxuuh9UHPS5S8rTFmCf0qbTJZo';
