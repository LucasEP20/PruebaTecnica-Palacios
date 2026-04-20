import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/users/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        // Conexión Relacional (MySQL) con TypeORM
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '1234',
            database: 'prueba-tecnica',
            autoLoadEntities: true, // Carga automática de entidades
            synchronize: true,      // Crea las tablas automáticamente (solo para desarrollo)
        }),
        // Conexión NoSQL (MongoDB) con Mongoose
        MongooseModule.forRoot('mongodb://localhost:27017/prueba-tecnica'),
        ConfigModule.forRoot({ isGlobal: true }), // Carga variables de entorno
        UserModule,
    ],
})
export class AppModule { }