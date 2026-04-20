import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserMongo extends Document {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    telefono!: string;

    @Prop()
    genero!: string; //campo adicional
}

export const UserMongoSchema = SchemaFactory.createForClass(UserMongo);