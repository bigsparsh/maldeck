import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "./ui/button";
import Link from "next/link";

const Header = ({ className }: { className?: string }) => {
    return <header className={"flex justify-between items-center px-4 py-2 gap-4 " + className}>
        <h1 className="text-xl font-semibold tracking-tight">MalDeck</h1>
        <div className="flex gap-2">
            <SignedOut>
                <SignUpButton>
                    <Button size="sm" variant="secondary">SignUp</Button>
                </SignUpButton>
                <SignInButton >
                    <Button size="sm">SignIn</Button>
                </SignInButton>
            </SignedOut>
            <SignedIn >

                <div className="flex gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="cursor-pointer">Dashboard</Button>
                    </Link>
                    <UserButton />
                </div>
            </SignedIn>
        </div>
    </header>
}

export default Header;
