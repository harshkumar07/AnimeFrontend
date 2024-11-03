'use client';

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"

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
    <div className="p-4">
      <h1 className="text-3xl font-bold mt-4 mb-4 ml-10">Search Anime</h1>
      <form onSubmit={handleSearch} className="mb-4 ml-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime..."
          className="border rounded p-2 bg-gray-200 text-black dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white rounded p-2 px-4 ml-2 transition duration-200 ease-in-out hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
          Search
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="flex justify-center items-center col-span-full">
            <p className="text-lg">
            <div className="rounded-lg p-4 shadow-lg flex flex-col items-center space-y-4 w-52 mx-auto">
                <Skeleton className="h-72 w-full rounded-lg" />
                <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full mx-auto" />
                    <Skeleton className="h-4 w-full mx-auto" />

            
                    
          </div>
        </div>
            </p>
          </div>
        ) : results.length > 0 ? (
          results.map((anime) => (
            <div 
              key={anime.id}
              onClick={() => navigateToAnimeDetail(anime.title)}
              className="cursor-pointer hover:bg-gray-200 bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 rounded shadow-md transition duration-200 ease-in-out flex flex-col items-center"
            >
              <img 
                src={anime.image} 
                alt={anime.title} 
                className="mb-2 w-full h-[300px] object-cover rounded-lg" 
                style={{ maxWidth: '220px' }} 
              />
              <div className="flex flex-col items-center text-center">
                <p className="font-semibold truncate text-center w-full overflow-hidden" style={{ maxWidth: '220px' }}>{anime.title}</p>
                <p className="text-sm"><strong>Release Date:</strong> {anime.releaseDate || "N/A"}</p>
                <p className="text-sm"><strong>Sub/Dub:</strong> {anime.subOrDub === "sub" ? "Subbed" : "Dubbed"}</p>
              </div>
            </div>
          ))
        ) : null} {/* Only render results if available */}
      </div>

      {/* Show pagination only if there are results and a search has been performed */}
      {results.length > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center items-center mt-4">
          {/* Previous Arrow */}
          <button 
            onClick={loadPreviousPage} 
            disabled={page === 1} 
            className="bg-blue-500 text-white rounded-full p-2 mr-2 transition duration-200 ease-in-out hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Pagination Numbers */}
          <div className="flex space-x-2 mx-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => fetchResults(index + 1)}
                className={`rounded-full p-2 transition duration-200 ease-in-out ${
                  page === index + 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"
                } hover:bg-blue-600`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Next Arrow */}
          <button 
            onClick={loadNextPage} 
            disabled={page >= totalPages} 
            className="bg-blue-500 text-white rounded-full p-2 ml-2 transition duration-200 ease-in-out hover:bg-blue-600"
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
