import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';

// Importa la Entidad (SQL) y el Esquema (NoSQL)
import { User } from './entities/user.entity';
import { UserHistorial } from './entities/user-historial.entity';
import { UserMongo, UserMongoSchema } from './schemas/user.schema';
import { UserHistorialMongo, UserHistorialMongoSchema } from './schemas/user-historial.schema';

@Module({
    imports: [
        // Registro de Entidades para TypeORM (MySQL)
        TypeOrmModule.forFeature([User, UserHistorial]),

        // Registro de Modelos para Mongoose (MongoDB)
        MongooseModule.forFeature([
            { name: UserMongo.name, schema: UserMongoSchema },
            { name: UserHistorialMongo.name, schema: UserHistorialMongoSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService], // Por si necesito usarlo en otros módulos
})
export class UserModule { }