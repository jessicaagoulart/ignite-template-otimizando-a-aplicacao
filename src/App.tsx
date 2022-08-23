import { useCallback, useMemo, useState } from "react";

import { SideBar } from "./components/SideBar";
import { Content } from "./components/Content";

import { api } from "./services/api";

import "./styles/global.scss";

import "./styles/sidebar.scss";
import "./styles/content.scss";

interface GenreResponseProps {
	id: number;
	name: "action" | "comedy" | "documentary" | "drama" | "horror" | "family";
	title: string;
}

interface MovieProps {
	imdbID: string;
	Title: string;
	Poster: string;
	Ratings: Array<{
		Source: string;
		Value: string;
	}>;
	Runtime: string;
}

export function App() {
	const [selectedGenreId, setSelectedGenreId] = useState(1);	const [genres, setGenres] = useState<GenreResponseProps[]>([]);
	const [movies, setMovies] = useState<MovieProps[]>([]);
	const [selectedGenre, setSelectedGenre] = useState<GenreResponseProps>(
		{} as GenreResponseProps
	);

	useMemo(() => {
		let data: GenreResponseProps[] = [];

		api.get<GenreResponseProps[]>("genres").then((response) => {
			data = response.data.map((genre: GenreResponseProps) => ({
				id: genre.id,
				name: genre.name,
				title: genre.title,
			}));
			setGenres(data);
		});

		return data;
	}, []);

	const getGenreById = useCallback(
		(genreId: number) => {
			api.get<GenreResponseProps>(`genres/${genreId}`).then((response) => {
				const formatResponse = {
					id: response.data.id,
					name: response.data.name,
					title: response.data.title,
				};
				setSelectedGenre(formatResponse);
			});
		},
		[selectedGenreId]
	);

	useMemo(() => {
		let data: MovieProps[] = [];

		getGenreById(selectedGenreId);

		api.get(`movies/?Genre_id=${selectedGenreId}`).then((response) => {
			data = response?.data?.map((movie: MovieProps) => {
				return {
					imdbID: movie.imdbID,
					Title: movie.Title,
					Poster: movie.Poster,
					Ratings: movie.Ratings.map((rating) => {
						return {
							Source: rating.Source,
							Value: rating.Value,
						};
					}),
					Runtime: movie.Runtime,
				};
			});
			setMovies(data);
		});
	}, [selectedGenreId]);

	function handleClickButton(id: number) {
		setSelectedGenreId(id);
	}

	return (
		<div style={{ display: "flex", flexDirection: "row" }}>
			<SideBar
				genres={genres}
				selectedGenreId={selectedGenreId}
				buttonClickCallback={handleClickButton}
			/>

			<Content selectedGenre={selectedGenre} movies={movies} />
		</div>
	);
}
