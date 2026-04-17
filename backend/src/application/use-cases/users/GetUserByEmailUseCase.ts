import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { validateEmail } from '../../../shared/utils/validators';

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<User | null> {
    const validEmail = validateEmail(email);
    return this.userRepository.findByEmail(validEmail);
  }
}
