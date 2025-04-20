import React, {ReactNode} from 'react'
import { Sidebar } from "@/components/Sidebar";
import {isAuthenticated} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";
const RootLayout = async ({children}:{children:ReactNode}) => {
    const isUserAuthenticated = await isAuthenticated();
    console.log(isUserAuthenticated)
    if(!isUserAuthenticated) redirect('/sign-in')

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden md:block w-64 flex-shrink-0"/>
            {children}
        </div>
    )
}
export default RootLayout
