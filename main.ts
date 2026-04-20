import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    // Crea la instancia de la aplicación usando el módulo raíz
    const app = await NestFactory.create(AppModule);

    // --- CONFIGURACIONES GLOBALES ---

    // 1. Habilitar CORS (necesario si vas a conectar un Frontend)
    app.enableCors();

    // 2. Prefijo global para la API
    // Las rutas serán: localhost:3000/api/users
    app.setGlobalPrefix('api');

    // 3. ValidationPipe
    // Hace que los @IsEmail, @IsString, etc., de los DTOs funcionen.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Elimina campos que no estén en el DTO
            forbidNonWhitelisted: true, // Lanza error si envían campos extra
            transform: true, // Transforma los tipos automáticamente (ej: string a number)
        }),
    );

    // Puerto de escucha
    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Servidor corriendo en: http://localhost:${port}/api`);
}

bootstrap();