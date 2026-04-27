import axios from "axios";

const api = axios.create({
  baseURL: "https://sportapi7.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": process.env.SPORTSAPI_KEY,
    "x-rapidapi-host": "sportapi7.p.rapidapi.com",
  },
});

export const fetchLiveMatches = async () => {
  const response = await api.get("/api/v1/sport/football/events/live");
  return response.data;
};

export const fetchUpcomingMatches = async (date) => {
  const response = await api.get(`/api/v1/sport/football/scheduled-events/${date}`);
  return response.data;
};

export const fetchMatchById = async (id) => {
  const response = await api.get(`/api/v1/event/${id}`);
  return response.data;
};
