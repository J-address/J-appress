import { loginSchema, registerSchema } from './auth.schema';

describe('registerSchema', () => {
  it('accepts valid email and password', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid email, password, and loginType', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      loginType: 'user',
    });
    expect(result.success).toBe(true);
  });

  it('accepts loginType admin', () => {
    const result = loginSchema.safeParse({
      email: 'admin@example.com',
      password: 'password123',
      loginType: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing loginType', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid loginType', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      loginType: 'superuser',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      loginType: 'user',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
      loginType: 'user',
    });
    expect(result.success).toBe(false);
  });
});
