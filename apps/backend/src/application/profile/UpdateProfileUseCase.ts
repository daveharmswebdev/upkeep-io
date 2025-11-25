import { injectable, inject } from 'inversify';
import { IProfileRepository } from '../../domain/repositories';
import { ValidationError } from '@domain/errors';
import { updateProfileSchema } from '@validators/profile';
import { Profile } from '@domain/entities';

interface UpdateProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

@injectable()
export class UpdateProfileUseCase {
  constructor(
    @inject('IProfileRepository') private profileRepository: IProfileRepository
  ) {}

  async execute(input: UpdateProfileInput): Promise<Profile> {
    // Extract update data (excluding userId)
    const { userId, ...updateData } = input;

    // Validate update data using shared schema
    const validation = updateProfileSchema.safeParse(updateData);
    if (!validation.success) {
      throw new ValidationError(validation.error.errors[0].message);
    }

    // Get or create profile
    let profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      // Create empty profile if doesn't exist
      profile = await this.profileRepository.create({ userId });
    }

    // Update profile with validated data
    const updatedProfile = await this.profileRepository.update(userId, updateData);

    return updatedProfile;
  }
}
