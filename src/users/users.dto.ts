import { IsOptional, IsNotEmpty, IsInt, Min, Max, Length } from 'class-validator';

export class RegisterUserDto {

    @IsNotEmpty()
    @Length(3, 50)
    username: string;

    @IsNotEmpty()
    @Length(3, 50)
    nick: string;

    @IsNotEmpty()
    @Length(8, 255)
    password: string;

}

export class CreateUserDto {

    @IsNotEmpty()
    @Length(3, 50)
    username: string;

    @IsNotEmpty()
    @Length(3, 50)
    nick: string;

    @IsNotEmpty()
    @Length(8, 255)
    password: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(255)
    permission: number;

}

export class UpdateUserDto {
    @IsOptional()
    @Length(3, 50)
    username: string;

    @IsOptional()
    @Length(3, 50)
    nick: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    @Length(8, 255)
    newPassword: string;

}

export class LoginDto {

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
    
}

export class TokenDto {
    id: number;
    username: string;
    permission: number;
}