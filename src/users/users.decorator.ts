import { applyDecorators, createParamDecorator, ExecutionContext, UseGuards, SetMetadata } from '@nestjs/common';
import { JwtAuthGuard, PermissionGuard } from 'src/auth/auth.guard';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user && user[data] : user;
  },
);