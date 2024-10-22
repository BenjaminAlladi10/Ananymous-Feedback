import mongoose, {Schema, model, Document} from "mongoose";
import { messageSchema, MessageSchemaType } from "./messageModel";

//userSchema type
export interface UserSchemaType extends Document
{
    username: string;
    email: string;
    password: string;

    verificationCode: string;
    verificationCodeExpiry: Date;
    isVerified: boolean;

    isAcceptingMessages: boolean;
    messages: MessageSchemaType[]
}

// userSchema
const userSchema: Schema<UserSchemaType>= new Schema({
    username:{
        type: String,
        required: [true, 'Username is required'],
        trime: true,
        unique: true,
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        trime: true,
        unique: true,
    },
    password:{
        type: String,
        required: [true, 'Password is required']
    },

    verificationCode:{
        type: String,
        required: [true, 'Verify Code is required'],
    },
    verificationCodeExpiry:{
        type: Date,
        required: [true, 'Verify Code Expiry is required'],
    },
    isVerified:{
        type: Boolean,
        default: false
    },

    isAcceptingMessages:{
        type: Boolean,
        default: true
    },
    messages: [messageSchema]
});

const User= mongoose.models.User || model<UserSchemaType>("User", userSchema);

export default User;