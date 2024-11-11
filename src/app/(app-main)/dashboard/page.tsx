"use client";

import { useToast } from '@/hooks/use-toast';
import { MessageSchemaType } from '@/models/messageModel';
import { ApiResponse } from '@/types/ApiResponse';
import { acceptMessageSchema } from '@/zodSchemas/acceptMessageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import{ UserSchemaType } from '@/models/userModel';
import { Separator } from '@radix-ui/react-separator';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { MessageCard } from '@/components/MessageCard';
import {Switch} from '@/components/ui/switch';

export default function Page()
{
    const [messages, setMessages]= useState<MessageSchemaType[]>([]);
    const [isMessagesLoading, setIsMessagesLoading]= useState(false);

    const [isSwitchLoading, setIsSwitchLoading]= useState(false);

    const {toast}= useToast();

    const handleDeleteMessage= (messageId: string)=>{
        setMessages((prevMessages)=> prevMessages.filter((message)=> message._id!== messageId))
    };

    const {data: session}= useSession();

    const {register, watch, setValue}= useForm({
        resolver: zodResolver(acceptMessageSchema),
        defaultValues: {
            acceptMessages: false
        }
    });

    const acceptMessagesFieldValue= watch("acceptMessages");
    console.log("1 acceptMessagesFieldValue:", acceptMessagesFieldValue);

    // Fetching Initial Switch Status 
    const fetchAcceptMessages= useCallback(async ()=>{
        setIsSwitchLoading(true);

        try 
        {
            const res= await axios.get("/api/accept-messages");
            setValue("acceptMessages", res.data.isAcceptingMessages);
        } 
        catch (error) 
        {
            const axiosError= error as AxiosError<ApiResponse>;

            toast({
              title: 'Error',
              description:
                axiosError.response?.data.message ??
                'Failed to fetch message settings',
              variant: 'destructive',
            });
        } 
        finally 
        {
            setIsSwitchLoading(false);
        } 
    }, [setValue, toast]);

    // Toggling the Switch Status
    const handleSwitchChange= async()=>{
        try 
        {
            const res=await axios.post<ApiResponse>("/api/accept-messages", {
                acceptMessages: !acceptMessagesFieldValue
            });

            setValue('acceptMessages', !acceptMessagesFieldValue);
            console.log("2 acceptMessagesFieldValue:", !acceptMessagesFieldValue);

            toast({
                title: res.data.message,
                variant: 'default',
            });
        } 
        catch (error) 
        {
            const axiosError = error as AxiosError<ApiResponse>;

            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to update message settings',
                variant: 'destructive',
            });
        }
    }


    // to set messages
    const fetchMessages= useCallback(async(refresh:boolean= false)=>{
        setIsMessagesLoading(true);
        setIsSwitchLoading(false);

        try 
        {
            const res= await axios.get<ApiResponse>("/api/get-messages");   
            setMessages(res.data.messages || []);

            if (refresh) {
                toast({
                  title: 'Refreshed Messages',
                  description: 'Showing latest messages',
                });
            }
        } 
        catch(error) 
        {
            console.log("error:", error);

            // toast({
            //     title: 'Error',
            //     description:
            //         axiosError.response?.data.message ?? 'Failed to fetch messages',
            //     variant: 'destructive',
            // });
        }
        finally
        {
            setIsMessagesLoading(false);
            setIsSwitchLoading(false);
        }
    }, [setIsMessagesLoading, setMessages, toast]);


    useEffect(() => {
        if (!session || !session.user) return;
    
        fetchMessages();
    
        fetchAcceptMessages();
      }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

      if (!session || !session.user) {
        return <div></div>;
      }
    
      const { username } = session?.user as UserSchemaType;
    
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const profileUrl = `${baseUrl}/u/${username}`;
    
      const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);

        toast({
          title: 'URL Copied!',
          description: 'Profile URL has been copied to clipboard.',
        });
      };

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}

                <div className="flex items-center">
                    <input type="text" value={profileUrl} disabled className="input input-bordered w-full p-2 mr-2"/>
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch {...register('acceptMessages')} checked={acceptMessagesFieldValue} onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}/>

                <span className="ml-2">
                    Accept Messages: {acceptMessagesFieldValue ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button className="mt-4" variant="outline" onClick={(e) => {
                e.preventDefault();
                fetchMessages(true);
            }}>
                {isMessagesLoading? <Loader2 className="h-4 w-4 animate-spin" /> :(
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard key={message._id as string} message={message} onMessageDelete={handleDeleteMessage}/>
                    ))
                ):(
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}
