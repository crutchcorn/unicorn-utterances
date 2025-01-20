import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "preact/hooks";
import { Pagination } from "components/pagination/pagination";
import { useSearchParams } from "./use-search-params";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";

import style from "./search-page.module.scss";
import { PostCardGrid } from "components/post-card/post-card-grid";
import { SubHeader } from "components/subheader/subheader";
import { Fragment } from "preact";
import { CollectionCard } from "components/collection-card/collection-card";
import { FilterDisplay } from "./components/filter-display";
import { useElementSize } from "../../hooks/use-element-size";
import { SearchTopbar } from "./components/search-topbar";
import { SearchHero } from "./components/search-hero";
import { LargeButton } from "components/button/button";
import retry from "src/icons/refresh.svg?raw";
import sadUnicorn from "../../assets/unicorn_sad.svg";
import happyUnicorn from "../../assets/unicorn_happy.svg";
import scaredUnicorn from "../../assets/unicorn_scared.svg";
import {
	SEARCH_PAGE_KEY,
	SearchQuery,
	serializeParams,
	deserializeParams,
	DisplayContentType,
	SortType,
	SearchFiltersData,
} from "./search";
import { SearchResultCount } from "./components/search-result-count";
import { isDefined } from "utils/is-defined";
import { OramaClientProvider, useOramaSearch } from "./orama";
import { SearchFooter } from "./components/search-footer";

const MAX_POSTS_PER_PAGE = 6;

function usePersistedEmptyRef<T extends object>(value: T) {
	const ref = useRef<T>();
	return useMemo(() => {
		if (Object.entries(value).length) {
			ref.current = value;
			return value;
		} else {
			return ref.current ?? value;
		}
	}, [value]);
}

const fetchSearchFilters = async ({ signal }: { signal: AbortSignal }) => {
	return fetch("/searchFilters.json", { signal, method: "GET" }).then(
		(res) => {
			if (!res.ok) {
				return res.text().then((text) => Promise.reject(text));
			}
			return res.json() as Promise<SearchFiltersData>;
		},
	);
};

export function SearchPageBase({siteTitle}:RootSearchPageProps) {
	const [query, setQueryState] = useSearchParams<SearchQuery>(
		serializeParams,
		deserializeParams,
	);

	const setQuery = useCallback((newQuery: Partial<SearchQuery>) => {
		const queryToSet = {
			...query,
			...newQuery,
		};

		if (queryToSet.searchQuery.length == 0) {
			// Remove tags and authors when no value is present
			queryToSet.filterTags = [];
			queryToSet.filterAuthors = [];
		}

		setQueryState(queryToSet);
	}, [query, setQueryState]);

	const resultsHeading = useRef<HTMLDivElement | null>(null);

	const setSearch = useCallback((str: string) => setQuery({ searchQuery: str, searchPage: 1 }), [setQuery]);

	const onManualSubmit = useCallback(
		(str: string) => {
			setQuery({ searchQuery: str, searchPage: 1 });
			resultsHeading.current?.focus();
		},
		[setQuery],
	);

	/**
	 * Fetch data
	 */
	const enabled = !!query.searchQuery;

	const {
		isLoading: isLoadingPeople,
		isFetching: isFetchingPeople,
		isError: isErrorPeople,
		error: errorPeople,
		data: people,
	} = useQuery({
		queryFn: fetchSearchFilters,
		queryKey: ["people"],
		initialData: {
			people: [],
			tags: [],
		} as SearchFiltersData,
		refetchOnWindowFocus: false,
		retry: false,
		enabled,
	});

	const { searchForTerm } = useOramaSearch();
	const fetchSearchQuery = useCallback(({ signal, queryKey: [_, query] }: { signal: AbortSignal, queryKey: [string, SearchQuery]}) => {
		// Analytics go brr
		plausible &&
			plausible("search", { props: { searchVal: query.searchQuery } });

		if (query.searchQuery) document.title = `${query.searchQuery} | ${siteTitle}`
		else if (query.searchQuery === "*") {document.title = `Search all | ${siteTitle}`}
		else {document.title = `Search | ${siteTitle}`}

		return searchForTerm(query, signal);
	}, [searchForTerm]);

	const {
		isLoading: isLoadingData,
		isFetching: isFetchingData,
		isError: isErrorData,
		error: errorData,
		data,
		refetch,
	} = useQuery({
		queryFn: fetchSearchQuery,
		queryKey: ["search", query],
		initialData: {
			posts: [],
			totalPosts: 0,
			collections: [],
			totalCollections: 0,
			tags: {},
			authors: {},
			duration: 0,
		},
		refetchOnWindowFocus: false,
		retry: false,
		enabled,
	});

	const isWildcardSearch = query.searchQuery === "*";
	// If the search is a wildcard, we want to use *every* tag/person filter (the search API returns a limited amount)
	const tagCounts = usePersistedEmptyRef(isWildcardSearch ? Object.fromEntries(people.tags.map(tag => [tag.id, tag.totalPostCount])) : data.tags);
	const authorCounts = usePersistedEmptyRef(isWildcardSearch ? Object.fromEntries(people.people.map(person => [person.id, person.totalPostCount])) : data.authors);

	const isError = isErrorPeople || isErrorData;

	useEffect(() => {
		if (errorPeople) {
			console.error("There was an error", { error: errorPeople });
		}
	}, [errorPeople]);

	useEffect(() => {
		if (errorData) {
			console.error("There was an error", { error: errorData });
		}
	}, [errorData]);

	const isContentLoading =
		isLoadingData || isFetchingData || isLoadingPeople || isFetchingPeople;

	const setSelectedPeople = useCallback(
		(authors: string[]) => {
			setQuery({
				filterAuthors: authors,
				searchPage: 1, // reset to page 1
			});
		},
		[setQuery],
	);

	const setSelectedTags = useCallback(
		(tags: string[]) => {
			setQuery({
				filterTags: tags,
				searchPage: 1, // reset to page 1
			});
		},
		[setQuery],
	);

	const setContentToDisplay = useCallback(
		(display: DisplayContentType) => {
			setQuery({
				display: display,
				searchPage: 1, // reset to page 1
			});
		},
		[setQuery],
	);

	const peopleMap = useMemo(() => {
		return new Map(people.people.map((person) => [person.id, person]));
	}, [people.people]);

	const showArticles = query.display === "all" || query.display === "articles";

	const showCollections =
		query.display === "all" || query.display === "collections";

	const setSort = useCallback(
		(sort: SortType) => {
			setQuery({
				sort: sort,
				searchPage: 1, // reset to page 1
			});
		},
		[setQuery],
	);

	/**
	 * Calculate the last page based on the number of posts.
	 */
	const lastPage = useMemo(
		() => Math.ceil(data.totalPosts / MAX_POSTS_PER_PAGE),
		[data.totalPosts],
	);

	/**
	 * Styles for header bar
	 */
	const { size, setEl } = useElementSize();

	useLayoutEffect(() => {
		const header = document.querySelector("#header-bar") as HTMLElement;
		setEl(header);
	}, []);

	const headerHeight = size.height;

	const [isFilterDialogOpen, setFilterIsDialogOpen] = useState(false);

	const noResults =
		enabled &&
		!isContentLoading &&
		((data.posts.length === 0 && showArticles && !showCollections) ||
			(data.collections.length === 0 &&
				showCollections &&
				!showArticles) ||
			(showCollections &&
				showArticles &&
				data.posts.length === 0 &&
				data.collections.length === 0));

	const numberOfCollections = showCollections
		? data.totalCollections
		: 0;

	const numberOfPosts = showArticles ? data.totalPosts : 0;

	return (
		<main className={style.fullPageContainer} data-hide-sidebar={!query.searchQuery}>
			<h1 className={"visually-hidden"}>Search</h1>
			<FilterDisplay
				isFilterDialogOpen={isFilterDialogOpen}
				setFilterIsDialogOpen={setFilterIsDialogOpen}
				tagCounts={tagCounts}
				authorCounts={authorCounts}
				peopleMap={peopleMap}
				selectedTags={query.filterTags}
				setSelectedTags={setSelectedTags}
				selectedAuthorIds={query.filterAuthors}
				setSelectedAuthorIds={setSelectedPeople}
				sort={query.sort}
				setSort={setSort}
				setContentToDisplay={setContentToDisplay}
				contentToDisplay={query.display}
				desktopStyle={{
					height: `calc(100vh - ${headerHeight}px)`,
					top: headerHeight,
					position: "sticky",
					// this should be overflow: clip; to prevent the browser scrolling within the element when a filter checkbox is focused:
					// https://stackoverflow.com/q/75419337
					// https://github.com/playfulprogramming/playfulprogramming/issues/653
					overflow: "clip",
				}}
				searchString={query.searchQuery}
			/>
			<div className={style.mainContents}>
				<SearchTopbar
					onSubmit={onManualSubmit}
					onBlur={setSearch}
					search={query.searchQuery}
					setSearch={setSearch}
					setContentToDisplay={setContentToDisplay}
					contentToDisplay={query.display}
					setSort={setSort}
					sort={query.sort}
					setFilterIsDialogOpen={setFilterIsDialogOpen}
					headerHeight={headerHeight}
				/>
				<section className={style.mainContentsInner}>
					{/* aria-live cannot be on an element that is programmatically removed
				or added via JSX, instead it has to listen to changes in DOM somehow */}
					<div
						aria-live={"polite"}
						aria-atomic="true"
						className={style.passThru}
					>
						{!isContentLoading &&
							(!!numberOfCollections || !!numberOfPosts) && (
								<SearchResultCount
									ref={resultsHeading}
									numberOfCollections={numberOfCollections}
									numberOfPosts={numberOfPosts}
								/>
							)}
						{!isError && isContentLoading && (
							<>
								<div className={style.loadingAnimationContainer}>
									<div className={style.loadingAnimation} />
									<p className={`text-style-headline-4 ${style.loadingText}`}>
										Fetching results...
									</p>
								</div>
							</>
						)}
					</div>
					<div
						aria-live="assertive"
						aria-atomic="true"
						className={style.passThru}
					>
						{!isError && !isContentLoading && noResults && (
							<SearchHero
								imageSrc={sadUnicorn.src}
								imageAlt={""}
								title={"No results found..."}
								description={"Please adjust your query or your active filters!"}
							/>
						)}
						{isError && (
							<SearchHero
								imageSrc={scaredUnicorn.src}
								imageAlt={""}
								title={"There was an error fetching your search results."}
								description={"Please adjust your query or try again."}
								buttons={
									<LargeButton
										onClick={() => refetch()}
										leftIcon={
											<span dangerouslySetInnerHTML={{ __html: retry }} />
										}
									>
										Retry
									</LargeButton>
								}
							/>
						)}
					</div>

					{!enabled && !isContentLoading && (
						<SearchHero
							imageSrc={happyUnicorn.src}
							imageAlt={""}
							title={"What would you like to find?"}
							description={
								"Search for your favorite framework or most loved language; we'll share what we know."
							}
						/>
					)}
					{enabled &&
						!isContentLoading &&
						showCollections &&
						Boolean(data.collections.length) && (
							<Fragment>
								<SubHeader
									tag="h2"
									text="Collections"
									id="collections-header"
									data-testid="collections-header"
								/>
								<ul
									aria-labelledby="collections-header"
									role="list"
									className={style.collectionsGrid}
								>
									{data.collections.map((collection) => (
										<li>
											<CollectionCard
												collection={collection}
												authors={collection.authors
													.map((id) => peopleMap.get(id + ""))
													.filter(isDefined)}
												headingTag="h3"
											/>
										</li>
									))}
								</ul>
							</Fragment>
						)}
					{enabled &&
						!isContentLoading &&
						showArticles &&
						Boolean(data.posts.length) && (
							<Fragment>
								<SubHeader
									tag="h2"
									text="Articles"
									id="articles-header"
									data-testid="articles-header"
								/>
								<PostCardGrid
									aria-labelledby={"articles-header"}
									postsToDisplay={data.posts}
									postAuthors={peopleMap}
									postHeadingTag="h3"
								/>
								<Pagination
									testId="pagination"
									softNavigate={(_href, pageNum) => {
										window.scrollTo(0, 0);
										setQuery({
											searchPage: pageNum,
										});
									}}
									page={{
										currentPage: query.searchPage,
										lastPage: lastPage,
									}}
									getPageHref={(pageNum) => {
										const pageParams = new URLSearchParams(
											window.location.search,
										);
										pageParams.set(SEARCH_PAGE_KEY, pageNum.toString());
										return `${
											window.location.pathname
										}?${pageParams.toString()}`;
									}}
								/>
							</Fragment>
						)}

					{enabled && !isContentLoading && !noResults && (
						<SearchFooter duration={data.duration} />
					)}
				</section>
			</div>
		</main>
	);
}

const queryClient = new QueryClient();

interface RootSearchPageProps{siteTitle: string}
export default function SearchPage({siteTitle}:RootSearchPageProps) {
	return (
		<OramaClientProvider>
			<QueryClientProvider client={queryClient}>
				<SearchPageBase siteTitle={siteTitle}/>
			</QueryClientProvider>
		</OramaClientProvider>
	);
}
