"use client";

import { messageSchema } from '@/zodSchemas/messageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import z from 'zod';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';


export default function Page() {
    const [isSending, setIsSending]= useState(false);

    const params= useParams();
    const username= params.username;

    const form= useForm({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: ""
        }
    });


    const onSubmit= async(data: z.infer<typeof messageSchema>)=>{
        console.log("data:", data);
        setIsSending(true);

        try 
        {
            const res= await axios.post("/api/send-message", {
                username: username,
                ...data
            });

            toast({
                title: res.data.message,
                variant: 'default',
            });

            form.setValue("content", "");
        } 
        catch (error) 
        {
            console.log("error:", error);

            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Error',
                description:
                axiosError.response?.data.message ?? 'Failed to sent message',
                variant: 'destructive',
            });
        }
        finally
        {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto my-8 mt-0 p-6 bg-gray-300 min-h-[100vh] rounded max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Public Profile Link
            </h1>

            <Form {...form}>
                <form action="" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField name="content" control={form.control}
                        render={({field})=>(
                            <FormItem>
                                <FormLabel className="text-sm">
                                    Send Anonymous Message to @{username}:
                                </FormLabel>

                                <FormControl>
                                    <Textarea placeholder="Write your anonymous message here" className="resize-none" {...field}></Textarea>
                                </FormControl>

                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="mt-2 flex justify-end">
                        {
                            !isSending?(
                                <Button type="submit">Send Message</Button>
                            ):(
                                <Button disabled={isSending}>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Sending...
                                </Button>
                            )
                        }
                    </div>
                </form>
            </Form>
        </div>
    );
}
