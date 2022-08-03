import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { User } from './user.entity';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '60m'
        }
      })
    })
  ],
  controllers: [AuthController, UserController],
  providers: [LocalStrategy, JwtStrategy, AuthService]
})
export class AuthModule {}