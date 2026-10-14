import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="flex justify-between">
        <Link href="/home" className="text-2xl font-bold text-pink-500">
          DateMate
        </Link>
    
      <div>
        <Link href="/signup" className="text-gray-700 hover:text-pink-500">
          Signup
        </Link>
        <Link href="/login" className="text-gray-700 hover:text-pink-500">
          Login
        </Link>
      </div>
        </div>
      <div className="flex gap-6">
        <Link href="/home" className="text-gray-700 hover:text-pink-500">
          Home
        </Link>
        <Link href="/invi" className="text-gray-700 hover:text-pink-500">
          Invitations
        </Link>
        <Link href="/chat" className="text-gray-700 hover:text-pink-500">
          Chat
        </Link>
        <Link href="/profile" className="text-gray-700 hover:text-pink-500">
          Profile
        </Link>
      </div>
    </div>
  );
}
