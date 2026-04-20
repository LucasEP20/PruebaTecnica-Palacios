import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'user-historial' })
export class UserHistorialMongo extends Document {
    @Prop({ required: true })
    userId!: string;

    @Prop({ required: true })
    accion!: string; // CREATE, UPDATE, DELETE

    @Prop({ type: Object })
    cambios!: any; // Valores anteriores y nuevos
}

export const UserHistorialMongoSchema = SchemaFactory.createForClass(UserHistorialMongo);