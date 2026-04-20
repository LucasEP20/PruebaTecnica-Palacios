import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';

// Integración con Twilio
import { Twilio } from 'twilio';

// Entidades SQL
import { User } from './entities/user.entity';
import { UserHistorial } from './entities/user-historial.entity';

// Schemas NoSQL
import { UserMongo } from './schemas/user.schema';
import { UserHistorialMongo } from './schemas/user-historial.schema';

import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';

@Injectable()
export class UserService {
    private twilioClient: Twilio; // Cliente de Twilio para enviar notificaciones
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserHistorial)
        private readonly sqlHistorialRepo: Repository<UserHistorial>,

        @InjectModel(UserMongo.name)
        private readonly userMongoModel: Model<UserMongo>,
        @InjectModel(UserHistorialMongo.name)
        private readonly mongoHistorialModel: Model<UserHistorialMongo>,
    ) {
        // Configuración de Twilio
        this.twilioClient = new Twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    // --- MÉTODOS CRUD ---

    async create(createUserDto: CreateUserDto) {
        // Validar duplicados en SQL
        const emailExists = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (emailExists) {
            throw new HttpException('El correo electrónico ya está registrado.', HttpStatus.BAD_REQUEST);
        }

        // 1. Guardar en MySQL
        const newUserSql = this.userRepository.create(createUserDto);
        const savedUserSql = await this.userRepository.save(newUserSql);

        // 2. Guardar en MongoDB
        const newUserMongo = new this.userMongoModel(createUserDto);
        await newUserMongo.save();

        // 3. Registrar Historial Automático
        await this.saveHistory(savedUserSql.id, 'CREATE', { info: 'Usuario inicializado', datos: createUserDto });

        return {
            message: 'Usuario creado exitosamente en ambos sistemas.',
            user: savedUserSql,
        };
    }

    async findAll() {
        // Listado desde SQL (más común para reportes relacionales)
        return await this.userRepository.find();
    }

    async findOne(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const userAnterior = await this.findOne(id);

        // 1. Detectar cambios (Diferencia entre estado anterior y nuevo)
        const cambios = this.getDiff(userAnterior, updateUserDto);

        // Si no hay cambios reales, evitamos procesar
        if (Object.keys(cambios.despues).length === 0) {
            return { message: 'No se detectaron cambios para actualizar.' };
        }

        // 2. Actualizar en MySQL
        await this.userRepository.update(id, updateUserDto);

        // 3. Actualizar en MongoDB (usando el email como identificador único)
        await this.userMongoModel.updateOne({ email: userAnterior.email }, updateUserDto);

        // 4. Registrar Historial
        await this.saveHistory(id, 'UPDATE', cambios);

        return { message: 'Usuario actualizado correctamente.' };
    }

    async remove(id: number) {
        const user = await this.findOne(id);

        // 1. Eliminar de ambos motores (Borrado físico)
        await this.userRepository.delete(id);
        await this.userMongoModel.deleteOne({ email: user.email });

        // 2. Registrar en historial
        await this.saveHistory(id, 'DELETE', { info: 'Registro eliminado físicamente de las bases de datos' });

        return { message: 'Usuario eliminado permanentemente.' };
    }

    // --- SISTEMA DE HISTORIAL Y NOTIFICACIONES ---

    async getHistory(id: number) {
        // Consultamos MongoDB para el historial
        return await this.mongoHistorialModel
            .find({ userId: id.toString() })
            .sort({ timestamp: -1 })
            .exec();
    }


    // --- FUNCIONES DE UTILIDAD (PRIVATE) ---

    private async saveHistory(userId: number, accion: string, cambios: any) {
        const entry = {
            userId,
            accion,
            cambios,
            timestamp: new Date(),
        };

        // Guardado dual del log
        await this.sqlHistorialRepo.save(entry);
        await new this.mongoHistorialModel(entry).save();
    }

    private getDiff(anterior: any, nuevo: any) {
        const cambios = { antes: {}, despues: {} };
        Object.keys(nuevo).forEach((key) => {
            if (nuevo[key] !== undefined && nuevo[key] !== anterior[key]) {
                cambios.antes[key] = anterior[key];
                cambios.despues[key] = nuevo[key];
            }
        });
        return cambios;
    }
    // Función para enviar notificaciones vía Twilio
    async sendNotification(id: number) {
        // Obtenemos el usuario para enviar la notificación
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado para enviar notificación.`);
        }
        // 2. Configuracion twilio
        const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        try {
            // 3. Enviar mensaje SMS
            await client.messages.create({
                body: `Hola ${user.name}, tu perfil ha sido actualizado.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.telefono,
            });

            //4. sI EL ENVIO ES EXITOSO, REGISTRAMOS EN EL HISTORIAL
            const logNotificacion = new this.mongoHistorialModel({
                userId: id.toString(),
                accion: 'NOTIFICATION',
                detalle: `Notificación enviada a ${user.name} (${user.telefono})`,
                fecha: new Date(),
            });
            await logNotificacion.save();
            return { message: `Notificación enviada a ${user.name} (${user.telefono})` };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            const logError = new this.mongoHistorialModel({
                userId: id.toString(),
                accion: 'NOTIFICATION_ERROR',
                detalle: `Error al enviar notificación: ${errorMessage}`,
                fecha: new Date(),
            });
            await logError.save();
            //hrow new HttpException('Error al enviar notificación', HttpStatus.INTERNAL_SERVER_ERROR);
            throw new HttpException(`Error Twilio: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
