import Header from "@/components/Header";
import Link from "next/link";

const Page = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full">
    <Header />
    <div className="flex border-t border-stone-400 overflow-y-hidden">
      <div className="flex flex-col border-r border-stone-400 text-2xl gap-3  py-10 p-5 h-[95vh] basis-2/12 font-semibold">
        <Link href="/dash">Your Backends</Link>
        <Link href="/dash/explore">Explore</Link>
        <Link href="/dash/chat">Chat</Link>
        <Link href="/dash/upload-post">Upload Post</Link>
        <Link href="/dash/graph" >Graph View</Link>
      </div>
      {children}
    </div>
  </div>
}
export default Page;
