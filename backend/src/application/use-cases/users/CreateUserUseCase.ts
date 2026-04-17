import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AppError } from '../../../shared/errors/AppError';
import { validateEmail } from '../../../shared/utils/validators';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<User> {
    const validEmail = validateEmail(email);

    const existing = await this.userRepository.findByEmail(validEmail);
    if (existing) {
      throw new AppError('User with this email already exists', 409);
    }

    return this.userRepository.create({ email: validEmail });
  }
}
