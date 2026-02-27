import Image from "next/image";

export default function Home() {
    return (
        <div className="flex-col flex min-h-screen items-center justify-center ">
            <h1 className="text-6xl">Content Comming Soon</h1>
            <div className="">
                <img
                    src="/logo/logo-removebg.png"
                    alt="SkillBridge Logo"
                    className="h-60 w-60 object-contain"
                />
            </div>
        </div>
    );
}
