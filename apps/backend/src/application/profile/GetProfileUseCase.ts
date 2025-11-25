import { injectable, inject } from 'inversify';
import { IProfileRepository } from '../../domain/repositories';
import { Profile } from '@domain/entities';

interface GetProfileInput {
  userId: string;
}

@injectable()
export class GetProfileUseCase {
  constructor(
    @inject('IProfileRepository') private profileRepository: IProfileRepository
  ) {}

  async execute(input: GetProfileInput): Promise<Profile> {
    // Try to get existing profile
    let profile = await this.profileRepository.findByUserId(input.userId);

    // If no profile exists, create an empty one
    if (!profile) {
      profile = await this.profileRepository.create({
        userId: input.userId,
      });
    }

    return profile;
  }
}
