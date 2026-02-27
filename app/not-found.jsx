import Image from "next/image";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      
      {/* Image */}
      <div className="mb-8">
        <Image
          src="/404/404.png"   // এখানে তুমি চাও যে ছবি use করবে
          alt="404 Not Found"
          width={800}
          height={800}
        />
      </div>

      {/* Main Text */}
      <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      {/* Call to Action */}
      <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
        Go Back Home
      </Link>
    </div>
  );
}