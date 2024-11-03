'use client'; // Correct the directive here

import Link from 'next/link';
import { ModeToggle } from './Toggle-Button';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white p-4 shadow-md dark:bg-black transition-colors duration-100 fixed top-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-black dark:text-white">
          <Link href="/">Anime</Link>
        </div>
        <ul className="flex space-x-4">
        
          <li>
            <Link href="/search" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
              Search
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
              About
            </Link>
          </li>
        </ul>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
