import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { CreateUserUseCase, LoginUserUseCase } from '../../application/auth';

@injectable()
export class AuthController {
  constructor(
    @inject(CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(LoginUserUseCase) private loginUserUseCase: LoginUserUseCase
  ) {}

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;

      const result = await this.createUserUseCase.execute({
        email,
        password,
        name,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this.loginUserUseCase.execute({
        email,
        password,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
