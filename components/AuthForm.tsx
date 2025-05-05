"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from "next/image";

import { Button } from "@/components/ui/button"
import {
    Form
} from "@/components/ui/form"
import React from "react";
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/firebase/client";
import {signIn, signUp} from "@/lib/actions/auth.action";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc'; // ✅ Google icon


const authFormSchema = (type : FormType) => {
    return z.object({
        name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(5),
    })

}
type FormType = "sign-in" | "sign-up";

const AuthForm = ({type}: {type: FormType}) => {
    const router = useRouter()
    const formSchema = authFormSchema(type);
    // 1. Define your form.

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })
    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Send token to your server to set session cookie
            const res = await fetch("/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: result.user.email, idToken }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.message || "Google sign-in failed");
                return;
            }

            toast.success("Signed in successfully");

            const role = data.user?.role;

            // Redirect based on role
            switch (role) {
                case "admin":
                    router.push("/");
                    break;
                case "finance":
                    router.push("/department-dashboard");
                    break;
                case "department":
                    router.push("/department-dashboard");
                    return;
                case "viewer":
                    router.push("/");
                    break;
            }

            return data;
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            toast.error("Google sign-in failed");
            return { success: false, message: "Sign-in failed" };
        }
    }

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if(type === 'sign-up') {
                const {name , email , password } = values;

                const userCredentials = await createUserWithEmailAndPassword(auth, email ,password);
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                })

                if(!result?.success){
                    toast.error(result?.message);
                    return;
                }

                toast.success('Account created Successfully. Please sign in.')
                router.push('/sign-in')
            }else{
                const {email,password} = values;
                const userCredential = await signInWithEmailAndPassword(auth , email , password);

                const idToken = await  userCredential.user.getIdToken();

                if(!idToken){
                    toast.error('Sign in failed')
                    return;
                }

                const result = await signIn({
                    email,
                    idToken,
                });

                if (!result?.success) {
                    toast.error(result?.message);
                    return;
                }

                toast.success("Sign in Successfully.");

                const role = result.user?.role; // ⬅️ extract the role
                console.log(role, 'this this role')
// Redirect based on role
                switch (role) {
                    case "admin":
                        router.push("/");
                        break;
                    case "finance":
                        router.push("/department-dashboard");
                        break;
                    case "department":
                        router.push("/department-dashboard");
                        return;
                    case "viewer":
                        router.push("/");
                        break;

                }
            }

        } catch (error) {
            console.log(error);
            toast.error(`There was an error: ${error}`)
        }

    }

    const isSignIn = type === 'sign-in';
    return (
        <div className="lg:min-w-[566px]">
            <div
                className="flex flex-col gap-6 rounded-2xl min-h-full py-14 px-10 border border-gray-300 shadow-lg bg-white">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/ParadoxLogo.png" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100 text-xl font-semibold">Sponsor Ship Management</h2>
                </div>
                <h3 className="text-center text-gray-600 mb-6">Manage MOU's and track Deliverables across
                    departments</h3>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="name"
                                label="Name"
                                placeholder="Your name"
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your Email"
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                        />
                        <Button type="submit"
                                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                            {isSignIn ? 'Sign in' : 'Create an Account'}
                        </Button>
                        <div className="relative w-full overflow-hidden rounded-lg p-[2px]">
                            {/* Beam Background */}
                            <div
                                className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-700 via-red-700 via-yellow-600 to-blue-600 blur-sm animate-border-beam"></div>

                            {/* Real Button */}
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => signInWithGoogle()}
                                className="relative flex items-center gap-2 w-full rounded-md bg-gray-50 text-black font-semibold"
                            >
                                <FcGoogle size={20}/>
                                Sign in with Google
                            </Button>
                        </div>
                    </form>
                </Form>

                <p className="text-center text-gray-500 mt-4">
                    {isSignIn ? "No account yet? Ask your core  " : "Have an account already? "}
                    <Link href={!isSignIn ? '/sign-in' : '/sign-up'}
                          className="font-bold text-user-primary hover:text-user-secondary transition">
                        {!isSignIn ? ' Sign in' : ' Sign up'}
                    </Link>
                </p>

            </div>
        </div>

    )
}
export default AuthForm
