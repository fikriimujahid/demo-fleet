import mongoose from "mongoose";
import { Password } from "../services/password";

interface UserAttrs {
    name: string;
    email: string;
    phone: number;
    password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
    name: string;
    email: string;
    phone: number;
    email_verified_at: string;
    password: string;
    deleted_by: number;
    created_by: number;
    updated_by: number;
    deleted_at: string;
    created_at: string;
    updated_at: string;
    photo: string;
}

const usersSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: Number
        },
        email_verified_at: { type: Date },
        password: {
            type: String,
            required: true
        },
        deleted_by: { type: Number },
        created_by: { type: Number },
        updated_by: { type: Number },
        deleted_at: { type: Date },
        updated_at: { type: Date },
        created_at: {
            type: Date,
            default: Date.now
        },
        photo: {
            type: String
        }
    },
    {
        toJSON: {
            transform(doc, ret, options) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        }
    }
);

usersSchema.pre('save', async function(done){
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
})

usersSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', usersSchema);

export { User };