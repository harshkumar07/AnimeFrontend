"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Episode {
  id: string;
  number: number;
  url: string;
}

interface AnimeInfo {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate: string | null;
  description: string | null;
  genres: string[];
  subOrDub: "sub" | "dub";
  type: string | null;
  status: string;
  otherName: string | null;
  totalEpisodes: number;
  episodes: Episode[];
}

interface StreamingSource {
  url: string;
  isM3U8: boolean;
  quality: string;
}

const AnimeDetail: React.FC<{ animeId: string }> = ({ animeId }) => {
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [episodeStreamingLinks, setEpisodeStreamingLinks] = useState<{ [key: string]: string | null }>({});

  // Fetch anime details by ID from the external API
  const fetchAnimeInfo = async (animeId: string) => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/info/${animeId}`;
    try {
      const { data } = await axios.get<AnimeInfo>(url);
      setAnimeInfo(data);
    } catch (err: any) {
      console.error("Error fetching anime info:", err);
      setError("Failed to load anime information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch streaming links for a specific episode
  const fetchStreamingLinks = async (episodeId: string) => {
    const url = `https://harshanime.vercel.app/anime/gogoanime/watch/${episodeId}`;
    try {
      const { data } = await axios.get(url, {
        headers: {
          Referer: "https://s3taku.com",
        },
      });

      const streamingSources: StreamingSource[] = data.sources ?? [];
      const selectedSource = streamingSources.find(source => source.quality === "360p");

      setEpisodeStreamingLinks(prev => ({
        ...prev,
        [episodeId]: selectedSource ? selectedSource.url : null,
      }));
    } catch (err: any) {
      console.error(`Error fetching streaming links for episode ${episodeId}:`, err);
      // Optionally set an error message for each episode
      setEpisodeStreamingLinks(prev => ({
        ...prev,
        [episodeId]: null, // You might set an error state here if needed
      }));
    }
  };

  // Use useEffect to fetch anime info when the component loads
  useEffect(() => {
    fetchAnimeInfo(animeId);
  }, [animeId]);

  // Use another useEffect to fetch streaming links for all episodes once anime info is fetched
  useEffect(() => {
    if (animeInfo) {
      animeInfo.episodes.forEach(episode => {
        fetchStreamingLinks(episode.id);
      });
    }
  }, [animeInfo]);

  return (
    <div>
      {loading && <p>Loading anime information...</p>}
      {error && <p>Error: {error}</p>}
      {animeInfo && (
        <div>
          <h1>{animeInfo.title}</h1>
          <img src={animeInfo.image} alt={animeInfo.title} width="200" />
          <p><strong>Other Name:</strong> {animeInfo.otherName || "N/A"}</p>
          <p><strong>Release Date:</strong> {animeInfo.releaseDate || "N/A"}</p>
          <p><strong>Description:</strong> {animeInfo.description || "No description available"}</p>
          <p><strong>Status:</strong> {animeInfo.status}</p>
          <p><strong>Genres:</strong> {animeInfo.genres.join(", ")}</p>

          <h2>Episodes</h2>
          <ul>
            {animeInfo.episodes.map(episode => (
              <li key={episode.id}>
                <a href={episodeStreamingLinks[episode.id] || '#'} target="_blank" rel="noopener noreferrer">
                  Episode {episode.number}
                </a>
                {episodeStreamingLinks[episode.id] && (
                  <div>
                    <h4>Streaming Link for Episode {episode.number} (360p)</h4>
                    
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnimeDetail;
