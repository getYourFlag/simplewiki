import { Injectable, ExecutionContext, HttpException, HttpStatus, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local'){}

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext) : Promise<boolean> {
        const minimumPermission = this.reflector.getAllAndOverride<number>('permission', [
            context.getClass(),
            context.getHandler()
        ]);
        if (!minimumPermission) return true; // Grant access if no specific level of permission is needed.

        const user = context.switchToHttp().getRequest().user;
        if (!user || user.permission < minimumPermission) throw new HttpException('Permissions denied.', HttpStatus.FORBIDDEN);
        return true;
    }
}