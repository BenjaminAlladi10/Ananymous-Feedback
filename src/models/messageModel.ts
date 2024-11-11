import {Schema, Document} from "mongoose";

//messageSchema type
export interface MessageSchemaType extends Document
{
    content: string;
    createdAt: Date;
}

//messageSchema
export const messageSchema: Schema<MessageSchemaType>= new Schema({
    content:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});