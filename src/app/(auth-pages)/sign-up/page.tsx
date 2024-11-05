"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

import Link from "next/link";
import { useState, useEffect } from "react";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { signUpSchema } from "@/zodSchemas/signUpSchema";

import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// import {useDebounceCallback} from "usehooks-ts";
import { useDebounce } from "use-debounce";
import { ApiResponse } from "@/types/ApiResponse";

export default function Page() {
  
  const [username, setUsername]= useState("");
  const [usernameMessage, setUsernameMessage]= useState("");

  const [isCheckingUsername, setIsCheckingUsername]= useState(false);
  const [isSubmitting, setIsSubmitting]= useState(false);

  const {toast}= useToast();
  const router= useRouter();

  const [debouncedUsername] = useDebounce(username, 300);

  const form= useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit= async(data: z.infer<typeof signUpSchema>)=>{

    console.log("onSubmit triggered");
    console.log("form:", form);
    console.log("data:", data);

    setIsSubmitting(true);

    try {
      const res= await axios.post("/api/sign-up", data);
      console.log("res:", res);

      toast({
        title: 'Success',
        description: res.data.message,
      });

      router.replace(`/verify/${username}`);
      setIsSubmitting(false);
    } 
    catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message ||
      ('There was a problem with your sign-up. Please try again.');

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setIsSubmitting(false);
    }
  };

  useEffect(()=>{
    const checkUsernameUnique= async ()=>{
      if(debouncedUsername)
      {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try 
        {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${debouncedUsername}`
          );

          setUsernameMessage(response.data.message);
          setIsCheckingUsername(false);
        } 
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          );

          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-2 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-4xl mb-4">
            Join Ananymous Feedback
          </h1>
          <p className="mb-2">Sign up to start your anonymous adventure!</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && username && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className='text-muted text-gray-600 text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className='w-full' disabled={isSubmitting || usernameMessage.includes("already taken")}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
