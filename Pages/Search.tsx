'use client';
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter

// Define types based on the API response structure
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
}

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>(""); // State to store the user's query
  const [results, setResults] = useState<Anime[]>([]); // State to store search results
  const [loading, setLoading] = useState<boolean>(false); // State to show loading
  const [page, setPage] = useState<number>(1); // State to manage pagination
  const [hasNextPage, setHasNextPage] = useState<boolean>(false); // State for next page
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false); // State for full-screen mode
  const router = useRouter(); // Initialize the router

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page } });
      setResults(data.results); // Set the anime results
      setHasNextPage(data.hasNextPage); // Update the hasNextPage status
      setIsFullScreen(true); // Enable full-screen mode
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/${query}`;
    try {
      const { data } = await axios.get<SearchResponse>(url, { params: { page: page + 1 } });
      setResults((prevResults) => [...prevResults, ...data.results]); // Append new results
      setPage(page + 1); // Increment the page number
      setHasNextPage(data.hasNextPage); // Update hasNextPage status
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle navigation to anime detail page
  const navigateToAnimeDetail = (animeTitle: string) => {
    const formattedTitle = animeTitle.toLowerCase().replace(/\s+/g, '-'); // Format title for URL
    router.push(`/anime/${formattedTitle}`); // Navigate to the detail page
  };

  // Function to close the full-screen search results
  const closeFullScreen = () => {
    setIsFullScreen(false);
    setQuery(""); // Clear the query when closing
    setResults([]); // Clear results when closing
    setPage(1); // Reset page to 1
    setHasNextPage(false); // Reset hasNextPage status
  };

  return (
    <div>
      <h1>Search Anime</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime..."
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>

      {/* Full-screen overlay for search results */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex flex-col">
          <button onClick={closeFullScreen} className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded">Close</button>
          {loading && <p className="text-center text-white">Loading...</p>}
          <div className="overflow-y-auto p-4">
            {results.length > 0 ? (
              <ul>
                {results.map((anime) => (
                  <li 
                    key={anime.id}
                    onClick={() => navigateToAnimeDetail(anime.title)} // Navigate on click
                    className="cursor-pointer hover:bg-gray-700 p-2 rounded text-white"
                  >
                    <p><strong>Title:</strong> {anime.title}</p>
                    <img src={anime.image} alt={anime.title} width="150" />
                    <p><strong>Release Date:</strong> {anime.releaseDate || "N/A"}</p>
                    <p><strong>Sub/Dub:</strong> {anime.subOrDub === "sub" ? "Subbed" : "Dubbed"}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">No results found</p>
            )}
          </div>
          {hasNextPage && (
            <button onClick={loadNextPage} disabled={loading} className="bg-blue-600 text-white p-2 rounded">Load More</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
