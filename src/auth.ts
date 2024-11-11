import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import dbConnect from "./lib/dbConnect";
import User from "./models/userModel";
import bcrypt from "bcrypt";

// Credentials: {
//   redirect: 'false',
//   identifier: 'xyz',
//   password: 'xyz123',
//   csrfToken: '282732d58296e3ed0ff296b484811e49198002de74d25597719a8e44443ddf00',
//   callbackUrl: 'http://localhost:3000/sign-in'
// }

const authOptions= {
    providers:[
        Credentials({
            id: "credentials",
            name: "Credentials",

            credentials: {
                username:{label:"Username", type:"text", placeholder:"John Doe"},
                email:{label:"Email", type:"email", placeholder:"johndoes@gmail.com"},
                password:{label:"Password", type:"password", placeholder:"******"}
            },

            authorize: async (credentials: any): Promise<any> => {
                await dbConnect();

                if (!credentials) {
                    throw new Error("Missing credentials");
                }

                try {
                    console.log("Credentials:", credentials);

                    const user= await User.findOne({
                        $or:[
                            {username: credentials?.identifier},
                            {email: credentials?.identifier}
                        ]
                    });

                    if(!user)
                    {
                        throw new Error("User not found");
                    }

                    if(!user.isVerified)
                    {
                        throw new Error("Please verify your account!");
                    }

                    const isPasswordCorrect= await bcrypt.compare(credentials.password, user.password);
                    if(isPasswordCorrect)
                    {
                        return user;
                    }
                    else
                    {
                        throw new Error("Incorrect password!");
                    }
                } 
                catch (error:any) {
                    throw new Error(error.message || "Authentication error");
                }
            }
        })
    ],

    callbacks:{
        async jwt({ token, user }: { token:any, user:any}) {
            if(user) {
                token._id = user._id?.toString();
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
            }
            return token
        },

        async session({ session, token } :{ session: any, token: any}) {
            if(token) {
                session.user._id = token._id?.toString();
                session.user.username = token.username;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
            }
            return session
        }
    },

    session: {
        strategy: "jwt" as const
    },

    pages: {
        signIn: '/sign-in',
        signOut: '/sign-out',
        // error: '/error'
    },

    secret: process.env.NEXTAUTH_SECRET
};

export const {handlers, auth, signIn, signOut}= NextAuth(authOptions);