import Header from "@/components/Header";
import { checkUser } from "@/lib/actions/User";
import Link from "next/link";

const Page = async ({ children }: { children: React.ReactNode }) => {
  await checkUser()
  return <div className="h-full">
    <Header />
    <div className="flex border-t border-stone-400 overflow-y-hidden">
      <div className="flex flex-col border-r border-stone-400 text-2xl gap-3  py-10 p-5 h-[95vh] basis-2/12 font-semibold">
        <Link href="/dashboard">Your Backends</Link>
      </div>
      {children}
    </div>
  </div>
}
export default Page;
