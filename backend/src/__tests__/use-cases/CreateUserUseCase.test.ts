import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { AppError } from '../../shared/errors/AppError';

const mockUser: User = { id: '1', email: 'test@example.com' };

function makeRepo(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(mockUser),
    ...overrides,
  };
}

describe('CreateUserUseCase', () => {
  it('creates a user when email does not exist', async () => {
    const repo = makeRepo();
    const useCase = new CreateUserUseCase(repo);

    const result = await useCase.execute('test@example.com');

    expect(repo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(repo.create).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(result).toEqual(mockUser);
  });

  it('throws 409 when user already exists', async () => {
    const repo = makeRepo({ findByEmail: jest.fn().mockResolvedValue(mockUser) });
    const useCase = new CreateUserUseCase(repo);

    await expect(useCase.execute('test@example.com')).rejects.toThrow(AppError);
    await expect(useCase.execute('test@example.com')).rejects.toMatchObject({ statusCode: 409 });
  });

  it('throws 400 for invalid email', async () => {
    const repo = makeRepo();
    const useCase = new CreateUserUseCase(repo);

    await expect(useCase.execute('not-an-email')).rejects.toThrow(AppError);
    await expect(useCase.execute('')).rejects.toThrow(AppError);
  });

  it('normalizes email to lowercase', async () => {
    const repo = makeRepo();
    const useCase = new CreateUserUseCase(repo);

    await useCase.execute('TEST@EXAMPLE.COM');

    expect(repo.create).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
