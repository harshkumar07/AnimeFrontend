"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";
import Image from "next/image"; // Import Image from next/image

interface VideoSource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

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

// Function to clean strings by removing special characters except hyphens
const cleanString = (str: string) => {
  return str.replace(/[^a-zA-Z0-9-\s]/g, ""); // Keep letters, numbers, spaces, and hyphens
};

const getEpisodeLink = (episodeId: string) =>
  `https://harshanime.vercel.app/anime/gogoanime/watch/${cleanString(episodeId)}`;

const AnimeDetail: React.FC<{ params: { id: string } }> = ({ params }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  const id = cleanString(decodeURIComponent(params.id));
  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchAnimeInfo = async (animeId: string) => {
    setLoading(true);
    const url = `https://harshanime.vercel.app/anime/gogoanime/info/${cleanString(animeId)}`;
    try {
      const { data } = await axios.get<AnimeInfo>(url);
      // Clean fields to remove special characters except hyphens
      data.title = cleanString(data.title);
      data.otherName = data.otherName ? cleanString(data.otherName) : null;
      data.description = data.description ? cleanString(data.description) : null;

      setAnimeInfo(data);
      if (data.episodes.length > 0) {
        fetchEpisodeSources(data.episodes[0].id); // Fetch sources for the first episode
        setSelectedEpisode(data.episodes[0].id); // Set the first episode as selected
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodeSources = async (episodeId: string) => {
    const url = getEpisodeLink(cleanString(episodeId));
    try {
      const { data } = await axios.get(url);
      const filteredSources = data.sources.filter(
        (source: VideoSource) =>
          source.quality !== "default" && source.quality !== "backup"
      );
      setVideoSources(filteredSources);
      // Set the default video source to the first element in the sources array
      if (filteredSources.length > 0) {
        setSelectedVideoUrl(filteredSources[0].url);
      }
    } catch (err: unknown) {
      console.error("Error fetching video sources:", err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handlePlayVideo = (episodeId: string) => {
    fetchEpisodeSources(episodeId); // Fetch and play video for the selected episode
    setSelectedEpisode(episodeId); // Update the selected episode
  };

  useEffect(() => {
    fetchAnimeInfo(id);
  }, [id]);

  useEffect(() => {
    if (selectedVideoUrl && videoRef.current) {
      if (Hls.isSupported() && selectedVideoUrl.endsWith(".m3u8")) {
        const hls = new Hls();
        hls.loadSource(selectedVideoUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play();
        });
        return () => {
          hls.destroy();
        };
      } else {
        videoRef.current.src = selectedVideoUrl;
        videoRef.current.play();
      }
    }
  }, [selectedVideoUrl]);

  return (
    <div className="p-5 font-sans bg-white text-black dark:bg-black dark:text-white mt-16">
    {loading && <p className="w-full text-center h-5 text-sm sm:text-base">Loading</p>}
    {error && <p className="w-full text-center text-red-500 text-sm sm:text-base">Error: {error}</p>}
    {animeInfo && (
      <div className="max-w-3xl mx-auto">
        {/* Anime Title Section */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-left">
          {animeInfo.title}
        </h1>
  
        {/* Video Player Section */}
        {selectedVideoUrl && (
           <div className="mb-5" > {/* 16:9 Aspect Ratio */}
            <video
              ref={videoRef}
              controls
              autoPlay
              className="rounded-lg w-full"
            >
              Your browser does not support the video tag.
            </video>
  
            {/* Quality Options Section */}
            <div className="flex justify-end mb-5 mt-5">
              {videoSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVideoUrl(source.url)}
                  className={`mx-1 py-1 px-3 text-xs sm:text-sm md:text-base rounded-lg transition duration-300 ${
                    selectedVideoUrl === source.url
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {source.quality}
                </button>
              ))}
            </div>
          </div>
        )}
  
        {/* Episodes Section */}
        <h2 className="mt-5 text-xl sm:text-2xl font-semibold mb-3">
          Episodes
        </h2>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-5">
          {animeInfo.episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handlePlayVideo(episode.id)}
              className={`flex items-center justify-center h-8 sm:h-10 w-20 sm:w-24 text-xs sm:text-sm md:text-base dark:text-white text-black rounded-lg shadow-md transition duration-300 ${
                selectedEpisode === episode.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
              }`}
            >
              Ep {episode.number}
            </button>
          ))}
        </div>
  
      {/* Description Section */}
      <div className="mt-5 sm:mt-10 flex flex-row">
      {/* Text Section */}
      <div className="w-[75%] pr-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          {animeInfo.title}
        </h2>
        <h2 className="text-lg font-semibold">Description:</h2>
        
        {/* Description with Read More / Read Less toggle */}
        <p
          className={`text-sm sm:text-base md:text-lg ${
            isExpanded ? "overflow-y-auto h-16 sm:h-44   custom-scrollbar" : "overflow-hidden max-h-16"
          } pt-2 pb-4`}
        >
          {animeInfo.description}
        </p>

        {/* Read More / Read Less Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)} // Toggle between expanded and collapsed
          className="text-blue-500 hover:underline"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      </div>

      {/* Image Section */}
      <div className="w-[25%] flex justify-center items-center mt-4 md:mt-0">
        <Image
          src={animeInfo.image}
          alt={animeInfo.title}
          className="rounded-lg max-w-full h-auto"
          width={300}
          height={400}
        />
      </div>
    </div>


        {/* Details Section */}
        <div className="mt-5 bg-gray-100 p-4 rounded-lg dark:bg-gray-800 text-sm sm:text-base md:text-lg">
          <p><strong>Other Name:</strong> {animeInfo.otherName || "N/A"}</p>
          <p><strong>Release Date:</strong> {animeInfo.releaseDate || "N/A"}</p>
          <p><strong>Status:</strong> {animeInfo.status}</p>
          <p><strong>Genres:</strong> {animeInfo.genres.join(", ")}</p>
          <p><strong>Total Episodes:</strong> {animeInfo.totalEpisodes}</p>
        </div>
      </div>
    )}
  </div>
  
  
  );
};

export default AnimeDetail;