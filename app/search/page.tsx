'use client';

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface Anime {
  id: string;
  title: string;
  image: string;
  releaseDate: string | null;
  subOrDub: "sub" | "dub";
}

interface SearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: Anime[];
  totalResults: number;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);
  const resultsPerPage = 10;
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page: 1 } });
      setResults(data.results);
      setTotalResults(data.totalResults);
      setPage(1);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (page >= Math.ceil(totalResults / resultsPerPage)) return;
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page: page + 1 } });
      setResults((prevResults) => [...prevResults, ...data.results]);
      setPage(page + 1);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousPage = async () => {
    if (page <= 1) return;
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page: page - 1 } });
      setResults(data.results);
      setPage(page - 1);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (pageNumber: number) => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page: pageNumber } });
      setResults(data.results);
      setPage(pageNumber);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAnimeDetail = (animeTitle: string) => {
    const formattedTitle = animeTitle.toLowerCase().replace(/\s+/g, '-');
    router.push(`/anime/${formattedTitle}`);
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="p-4 mt-20">
      <form 
        onSubmit={handleSearch} 
        className="flex items-center justify-center mb-4 space-x-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime..."
          className="flex-grow max-w-80 h-10 px-4 rounded-lg border-gray-800 bg-gray-200 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white h-10 rounded-lg p-2 px-4 transition duration-200 ease-in-out hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="flex justify-center items-center col-span-full">
            <div className="rounded-lg p-4 shadow-lg flex flex-col items-center space-y-4 w-52 mx-auto">
              <Skeleton className="h-72 w-full rounded-lg" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-full mx-auto" />
                <Skeleton className="h-4 w-full mx-auto" />
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          results.map((anime) => (
            <div 
              key={anime.id}
              onClick={() => navigateToAnimeDetail(anime.title)}
              className="cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded shadow-md transition duration-200 ease-in-out flex flex-col items-center"
            >
              <img 
                src={anime.image} 
                alt={anime.title} 
                className="w-full h-[260px] object-cover rounded-lg" 
              />
              <div className="flex flex-col items-center text-center p-2">
                <p className="font-semibold text-sm sm:text-base md:text-lg truncate w-full overflow-hidden">{anime.title}</p>
                <p className="text-xs sm:text-sm md:text-base"><strong>Release Date:</strong> {anime.releaseDate || "N/A"}</p>
                <p className="text-xs sm:text-sm md:text-base"><strong>Sub/Dub:</strong> {anime.subOrDub === "sub" ? "Subbed" : "Dubbed"}</p>
              </div>
            </div>
          ))
        ) : null}
      </div>

      {results.length > 0 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button 
            onClick={loadPreviousPage} 
            disabled={page === 1} 
            className="bg-blue-500 text-white rounded-full p-2 transition duration-200 ease-in-out hover:bg-blue-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => fetchResults(index + 1)}
                className={`rounded-full px-3 py-1 transition duration-200 ease-in-out ${
                  page === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"
                } hover:bg-blue-600`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button 
            onClick={loadNextPage} 
            disabled={page >= totalPages} 
            className="bg-blue-500 text-white rounded-full p-2 transition duration-200 ease-in-out hover:bg-blue-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
