export class CreateUserDto {
    username: string;
    nick: string;
    password: string;
    permission: number;
}

export class LoginDto {
    username: string;
    password: string;
}