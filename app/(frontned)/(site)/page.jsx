import Image from "next/image";
import Hero from '@/app/components/home/Hero';
import Ecosystem from "@/app/components/home/Ecosystem";
import Stats from "@/app/components/home/Stats";

export default function Home() {
    return (
        <div className="">

        <Hero></Hero>
        <Ecosystem></Ecosystem>
        <Stats></Stats>
        </div>
    );
}
