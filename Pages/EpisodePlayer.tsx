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

const AnimeDetail: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [episodeStreamingLinks, setEpisodeStreamingLinks] = useState<{ [key: string]: string | null }>({});

  // Fetch anime details
  const fetchAnimeInfo = async (animeId: string) => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/info/${animeId}`;
    try {
      const { data } = await axios.get<AnimeInfo>(url);
      setAnimeInfo(data);
    } catch (err: any) {
      setError("Failed to load anime information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch streaming links for a specific episode in 360p
  const fetchStreamingLink = async (episodeId: string) => {
    const url = `https://harshanime.vercel.app/anime/gogoanime/watch/${episodeId}`;
    try {
      const { data } = await axios.get(url, {
        headers: {
          Referer: "https://s3taku.com",
        },
      });
      const streamingSources: StreamingSource[] = data.sources || [];
      const source360p = streamingSources.find(source => source.quality === "360p");
      setEpisodeStreamingLinks(prevLinks => ({
        ...prevLinks,
        [episodeId]: source360p ? source360p.url : null,
      }));
    } catch (err: any) {
      console.error(err);
      setEpisodeStreamingLinks(prevLinks => ({
        ...prevLinks,
        [episodeId]: null,
      }));
    }
  };

  // Fetch anime info on component load
  useEffect(() => {
    fetchAnimeInfo(id);
  }, [id]);

  // Fetch streaming links for episodes once anime info is loaded
  useEffect(() => {
    if (animeInfo) {
      animeInfo.episodes.forEach(episode => {
        fetchStreamingLink(episode.id);
      });
    }
  }, [animeInfo]);

  return (
    <div>
      {loading && <p>Loading...</p>}
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
          <p><strong>Total Episodes:</strong> {animeInfo.totalEpisodes}</p>

          <h2>Episodes</h2>
          <ul>
            {animeInfo.episodes.map((episode) => (
              <li key={episode.id}>
              <p>Episode {episode.number}</p>
              {episodeStreamingLinks[episode.id] ? (
                <a href={episodeStreamingLinks[episode.id]!} target="_blank" rel="noopener noreferrer">
                  Watch 360p
                </a>
              ) : (
                <p>Loading link...</p>
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
