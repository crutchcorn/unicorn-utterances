import type { TypedDocument, Orama, Results, Nullable } from "@orama/orama";
import { OramaClient, SortByClauseUnion } from "@oramacloud/client";
import { PostInfo } from "types/PostInfo";
import { CollectionInfo } from "types/CollectionInfo";
import { PropsWithChildren } from "components/types";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { SearchQuery } from "./search";
import {
	ORAMA_COLLECTIONS_API_KEY,
	ORAMA_COLLECTIONS_ENDPOINT,
	ORAMA_POSTS_API_KEY,
	ORAMA_POSTS_ENDPOINT,
} from "./constants";

const postSchema = {
	slug: "string",
	tags: "enum[]",
	authors: "enum[]",
	title: "string",
	excerpt: "string",
	description: "string",
	searchMeta: "string",
	publishedTimestamp: "number",
} as const;

const collectionSchema = {
	slug: "string",
	title: "string",
	excerpt: "string",
	description: "string",
	searchMeta: "string",
	tags: "enum[]",
	authors: "enum[]",
	publishedTimestamp: "number",
} as const;

type PostDocument = TypedDocument<Orama<typeof postSchema>>;
type CollectionDocument = TypedDocument<Orama<typeof collectionSchema>>;

export interface SearchContext {
	postClient: OramaClient;
	collectionClient: OramaClient;
}

export const SearchClient = createContext<SearchContext>(undefined as never);

interface OramaClientProviderProps extends PropsWithChildren {
	params?: Partial<ConstructorParameters<typeof OramaClient>[0]>;
}

export function OramaClientProvider(props: OramaClientProviderProps) {
	const postClient = new OramaClient({
		endpoint: ORAMA_POSTS_ENDPOINT,
		api_key: ORAMA_POSTS_API_KEY,
		...props.params,
	});

	const collectionClient = new OramaClient({
		endpoint: ORAMA_COLLECTIONS_ENDPOINT,
		api_key: ORAMA_COLLECTIONS_API_KEY,
		...props.params,
	});

	const context: SearchContext = { postClient, collectionClient };

	return (
		<SearchClient.Provider value={context}>
			{props.children}
		</SearchClient.Provider>
	);
}

export function useOramaSearch() {
	const searchCtx = useContext(SearchClient);
	return {
		searchForTerm: (query: SearchQuery, signal: AbortSignal) =>
			searchForTerm(searchCtx, query, signal),
	};
}

/**
 * Given two Record<string, number>, combines them into one record, summing any overlapping entries.
 * Ex. addMerge({a:1,b:2}, {b:1}) -> {a:1,b:3}
 */
function addMerge(
	obj1: Record<string, number>,
	obj2: Record<string, number>,
): Record<string, number> {
	return Object.entries(obj2).reduce(
		(acc, [key, value]) => ({ ...acc, [key]: (acc[key] || 0) + value }),
		{ ...obj1 },
	);
}

export async function searchForTerm(
	{ postClient, collectionClient }: SearchContext,
	query: SearchQuery,
	signal: AbortSignal,
) {
	const term = query.searchQuery === "*" ? "" : query.searchQuery;
	const sortBy: SortByClauseUnion | undefined =
		query.sort === "relevance"
			? // When term is empty (returning all results), there is no "relevance" to sort by - so this defaults to a sort by newest
				term.length > 0
				? undefined
				: { property: "publishedTimestamp", order: "desc" }
			: {
					property: "publishedTimestamp",
					order: query.sort === "newest" ? "desc" : "asc",
				};

	// Schema should be passed to `search` method when:
	// https://github.com/askorama/oramacloud-client-javascript/pull/35
	// is working. Does not seem tp be reflected in the type definitions at present,
	const postSearchPromise: Promise<Nullable<Results<PostDocument>>> =
		postClient.search(
			{
				term,
				limit: 6,
				offset: 6 * (query.searchPage - 1),
				sortBy,
				where: {
					tags: query.filterTags.length ? query.filterTags : undefined,
					authors: query.filterAuthors.length ? query.filterAuthors : undefined,
				},
				facets: {
					tags: {
						limit: 50,
					},
					authors: {
						limit: 50,
					},
				},
				mode: "hybrid",
			},
			{
				debounce: 0,
				abortController: { signal } as never as AbortController,
				// // TODO: This does nothing yet:
				// // https://github.com/askorama/oramacloud-client-javascript/pull/34
				// abortSignal: signal,
			},
		);

	const collectionSearchPromise: Promise<
		Nullable<Results<CollectionDocument>>
	> = collectionClient.search(
		{
			term,
			limit: 4,
			offset: 4 * (query.searchPage - 1),
			sortBy,
			where: {
				tags: query.filterTags.length ? query.filterTags : undefined,
				authors: query.filterAuthors.length ? query.filterAuthors : undefined,
			},
			facets: {
				tags: {
					limit: 50,
				},
				authors: {
					limit: 50,
				},
			},
			mode: "hybrid",
		},
		{
			debounce: 0,
			abortController: { signal } as never as AbortController,
			// abortSignal: signal,
		},
	);

	const [postSearch, collectionSearch] = await Promise.all([
		postSearchPromise,
		collectionSearchPromise,
	]);

	// Combine tags & authors facets between the two searches
	const tags = addMerge(
		postSearch?.facets?.tags?.values ?? {},
		collectionSearch?.facets?.tags?.values ?? {},
	);

	const authors = addMerge(
		postSearch?.facets?.authors?.values ?? {},
		collectionSearch?.facets?.authors?.values ?? {},
	);

	const duration = Math.round(
		Math.max(
			postSearch?.elapsed?.raw ?? 0,
			collectionSearch?.elapsed?.raw ?? 0,
		) / 1000000,
	);

	return {
		posts: (postSearch?.hits.map((hit) => hit.document) ?? []) as Array<
			PostDocument & PostInfo
		>,
		totalPosts: postSearch?.count ?? 0,
		collections: (collectionSearch?.hits.map((hit) => hit.document) ??
			[]) as Array<CollectionDocument & CollectionInfo>,
		totalCollections: collectionSearch?.count ?? 0,
		tags,
		authors,
		duration: isFinite(duration) ? duration : 0,
	};
}
