import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Type for token payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET env is not defined');

    super({
      // Extract token from the header authorization: Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // IF the token is valid, this method will be executed
  // Later injected in request.user
  async validate(payload: JwtPayload) {
    if (!payload.organizationId) {
      throw new UnauthorizedException('Invalidd token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
