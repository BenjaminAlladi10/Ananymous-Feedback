import {Schema, Document} from "mongoose";
import { string } from "zod";

//messageSchema type
export interface MessageSchemaType extends Document
{
    content: String;
    createdAt: Date;
}

//messageSchema
export const messageSchema: Schema<MessageSchemaType>= new Schema({
    content:{
        type: string,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});