"use client";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/zodSchemas/verifySchema';



export default function Page() {
    const router= useRouter();
    const params= useParams();
    const {toast}= useToast();

    const form= useForm({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: ""
        }
    });

    const onSubmit= async(data: z.infer<typeof verifySchema>)=>{
        console.log("form:", form);
        console.log("data:", data);

        const username= decodeURIComponent(params?.username as string);
        console.log("username:", username);

        try 
        {
            const response = await axios.post("/api/verify-code", {
                username: username,
                code: data.code,
              });
        
              toast({
                title: 'Success',
                description: response.data.message,
              });
        
              router.replace('/sign-in');
        } 
        catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Verification Failed',
                description:
                axiosError.response?.data.message ??
                'An error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-4xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-2">Enter the verification code sent to your email</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        name="code"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <Input {...field} />
                                <FormMessage />
                            </FormItem>
                        )}/>

                        <Button type="submit">Verify Account</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
