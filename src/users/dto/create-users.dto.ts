import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    name!: string;

    @IsEmail({}, { message: 'El formato del email no es válido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    telefono!: string;

    @IsString()
    @IsOptional()
    // Este es el campo adicional de nuestra elección
    genero?: string;
}