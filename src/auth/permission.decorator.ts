import { SetMetadata } from "@nestjs/common";

export const MinimumPermissionLevel = (permission: number) => SetMetadata('permission', permission);