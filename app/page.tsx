'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Anime {
  id: string;
  title: string;
  image: string;
  url: string;
  genres: string[];
}

interface TopAiringResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: Anime[];
}

export default function Home() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTopAiring = async () => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/top-airing`;
    try {
      const { data } = await axios.get<TopAiringResponse>(url);
      setAnimeList(data.results);
    } catch (error) {
      console.error("Error fetching top airing anime", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopAiring();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'right' ? 300 : -300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="my-4 mt-20 text-white">
      <h1 className="text-3xl font-bold mb-4 text-left text-blue-600 ml-12 mt-6">Top Airing Anime</h1>
      {loading && (
        <div className="flex justify-center w-full p-4">
          <div className="grid gap-8 w-full sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="rounded-lg p-4 shadow-lg flex flex-col items-center space-y-4 w-52 mx-auto">
                <Skeleton className="h-72 w-full rounded-lg" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full mx-auto" />
                  <Skeleton className="h-4 w-full mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && animeList.length > 0 && (
        <div className="relative">
          <button
            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200 w-10 h-10 flex items-center justify-center"
            onClick={() => scrollCarousel('left')}
          >
            <span className="text-xl">&lt;</span>
          </button>
          <div
            className="overflow-hidden whitespace-nowrap"
            ref={scrollRef}
          >
            <div className="flex space-x-4 p-4">
              {animeList.map((anime) => (
                <div key={anime.id} className="flex-shrink-0 w-48 h-80 relative rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
                  <Link href={`/anime/${anime.id}`}>
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                      loading="lazy"
                    />
                    <div className="p-4 h-16">
                      <p className="text-black dark:text-white text-md font-semibold truncate">{anime.title}</p>
                      <p className="text-black dark:text-gray-400 text-sm truncate">{anime.genres.join(', ')}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200 w-10 h-10 flex items-center justify-center"
            onClick={() => scrollCarousel('right')}
          >
            <span className="text-xl">&gt;</span>
          </button>
        </div>
      )}
    </div>
  );
}
