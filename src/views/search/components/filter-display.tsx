import { ProfilePictureMap } from "utils/get-unicorn-profile-pic-map";
import { PostInfo } from "types/PostInfo";
import { ExtendedCollectionInfo } from "types/CollectionInfo";
import { useMemo } from "preact/hooks";
import { UnicornInfo } from "types/UnicornInfo";
import { CSSProperties } from "preact/compat";
import { useWindowSize } from "../../../hooks/use-window-size";
import { tabletLarge } from "../../../tokens/breakpoints";
import { FilterDialog } from "./filter-dialog";
import { FilterSidebar } from "./filter-sidebar";

interface FilterDisplayProps {
	unicornProfilePicMap: ProfilePictureMap;
	posts: PostInfo[];

	collections: ExtendedCollectionInfo[];
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
	selectedAuthorIds: string[];
	setSelectedAuthorIds: (authors: string[]) => void;
	sort: "newest" | "oldest";
	setSort: (sortBy: "newest" | "oldest") => void;
	desktopStyle?: CSSProperties;
	isFilterDialogOpen: boolean;
	setFilterIsDialogOpen: (isOpen: boolean) => void;
}

export const FilterDisplay = ({
	unicornProfilePicMap,
	collections,
	posts,
	sort,
	setSort,
	selectedAuthorIds,
	selectedTags,
	setSelectedAuthorIds,
	setSelectedTags,
	desktopStyle,
	isFilterDialogOpen,
	setFilterIsDialogOpen,
}: FilterDisplayProps) => {
	const tags = useMemo(() => {
		const tags = new Set<string>();
		posts.forEach((post) => {
			post.tags.forEach((tag) => {
				tags.add(tag);
			});
		});
		return Array.from(tags);
	}, [posts]);

	const authors = useMemo(() => {
		const authors: UnicornInfo[] = [];
		posts.forEach((post) => {
			post.authorsMeta.forEach((author) => {
				authors.push(author);
			});
		});

		collections.forEach((collection) => {
			collection.authorsMeta.forEach((author) => {
				authors.push(author);
			});
		});

		const uniqueAuthors = new Map<string, UnicornInfo>();
		authors.forEach((author) => {
			uniqueAuthors.set(author.id, author);
		});
		return Array.from(uniqueAuthors.values());
	}, [posts, collections]);

	const onSelectedAuthorChange = (id: string) => {
		const isPresent = selectedAuthorIds.includes(id);
		if (isPresent) {
			setSelectedAuthorIds(selectedAuthorIds.filter((author) => author !== id));
		} else {
			setSelectedAuthorIds([...selectedAuthorIds, id]);
		}
	};

	const onTagsChange = (id: string) => {
		const isPresent = selectedTags.includes(id);
		if (isPresent) {
			setSelectedTags(selectedTags.filter((tag) => tag !== id));
		} else {
			setSelectedTags([...selectedTags, id]);
		}
	};

	const windowSize = useWindowSize();

	const shouldShowDialog = windowSize.width < tabletLarge;

	if (shouldShowDialog) {
		return (
			<FilterDialog
				isOpen={isFilterDialogOpen}
				onClose={(val) => {
					alert(val);
					setFilterIsDialogOpen(false);
				}}
			/>
		);
	}

	return (
		<FilterSidebar
			unicornProfilePicMap={unicornProfilePicMap}
			sort={sort}
			setSort={setSort}
			selectedAuthorIds={selectedAuthorIds}
			selectedTags={selectedTags}
			setSelectedAuthorIds={setSelectedAuthorIds}
			setSelectedTags={setSelectedTags}
			desktopStyle={desktopStyle}
			tags={tags}
			authors={authors}
			onSelectedAuthorChange={onSelectedAuthorChange}
			onTagsChange={onTagsChange}
		/>
	);
};