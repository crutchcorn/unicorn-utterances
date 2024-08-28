import style from "./search-topbar.module.scss";
import { SearchInput } from "components/input/input";
import { Button, IconOnlyButton, LargeButton } from "components/button/button";
import filter from "src/icons/filter.svg?raw";
import forward from "src/icons/arrow_right.svg?raw";
import { Item, Select } from "components/select/select";
import {
	RadioButton,
	RadioButtonGroup,
} from "components/button-radio-group/button-radio-group";
import { SortType } from "src/views/search/search";
import { useEffect, useState } from "preact/hooks";

interface SearchTopbarProps {
	onSubmit: (search: string) => void;
	onBlur: (search: string) => void;
	search: string;
	setSearch: (search: string) => void;
	setContentToDisplay: (content: "all" | "articles" | "collections") => void;
	contentToDisplay: "all" | "articles" | "collections";
	sort: SortType;
	setSort: (sortBy: SortType) => void;
	setFilterIsDialogOpen: (isOpen: boolean) => void;
	headerHeight: number;
}

export const SearchTopbar = ({
	onSubmit,
	onBlur,
	search,
	setSearch,
	setContentToDisplay,
	contentToDisplay,
	setSort,
	sort,
	setFilterIsDialogOpen,
	headerHeight,
}: SearchTopbarProps) => {
	const [searchInput, setSearchInput] = useState(search);
	useEffect(() => setSearchInput(search), [search]);

	function handleBlur(e: FocusEvent) {
		const newVal = (e.target as HTMLInputElement).value;
		setSearchInput(newVal);
		setSearch(newVal);
		onBlur(newVal);
	}

	function handleInput(e: InputEvent) {
		const newVal = (e.target as HTMLInputElement).value;
		setSearchInput(newVal);
		setSearch(newVal);
	}

	return (
		<section
			className={style.topBar}
			style={{
				position: "sticky",
				zIndex: 9,
				marginTop: -2,
				top: `${headerHeight - 2}px`,
			}}
		>
			<form
				role="search"
				aria-label="Search our content"
				className={style.searchbarRow}
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit(searchInput);
				}}
			>
				<SearchInput
					id="search-bar"
					data-testid="search-input"
					aria-description={"Results will update as you type"}
					class={style.searchbar}
					usedInPreact={true}
					value={searchInput}
					onBlur={handleBlur}
					onInput={handleInput}
				/>
				<LargeButton class={style.searchTextButton} tag="button" type="submit">
					Search
				</LargeButton>
				<IconOnlyButton
					class={style.searchIconButton}
					tag="button"
					type="submit"
					aria-label="Search"
					dangerouslySetInnerHTML={{ __html: forward }}
					children={[]}
				/>
			</form>
			<div className={style.bigScreenContainer} />
			<div className={style.smallScreenContainer}>
				<div class={`${style.divider} ${style.topDivider}`} />
				<div className={`${style.divider} ${style.middleDivider}`} />
				<RadioButtonGroup
					className={style.contentToDisplayGroup}
					testId={"content-to-display-group-topbar"}
					value={contentToDisplay}
					label={"Content to display"}
					onChange={(val) => setContentToDisplay(val as "all")}
				>
					<RadioButton aria-label={"All"} value={"all"}>
						All
					</RadioButton>
					<RadioButton value={"articles"}>Articles</RadioButton>
					<RadioButton value={"collections"}>Collections</RadioButton>
				</RadioButtonGroup>
				<Button
					onClick={() => setFilterIsDialogOpen(true)}
					tag="button"
					class={style.filterTextButton}
					type="button"
					leftIcon={
						<span
							className={style.filterIconContainer}
							dangerouslySetInnerHTML={{ __html: filter }}
						></span>
					}
				>
					Filter
				</Button>
				<Select
					className={style.sortOrderGroup}
					testId={"sort-order-group-topbar"}
					label={"Post sort order"}
					prefixSelected={"Sort by: "}
					defaultValue={"Relevance"}
					selectedKey={sort}
					onSelectionChange={(v) => setSort(v as SortType)}
				>
					<Item key={"relevance"}>Relevance</Item>
					<Item key={"newest"}>Newest</Item>
					<Item key={"oldest"}>Oldest</Item>
				</Select>
				<IconOnlyButton
					class={style.filterIconButton}
					tag="button"
					type="button"
					onClick={() => setFilterIsDialogOpen(true)}
					aria-label="Filter"
				>
					<span
						className={style.filterIconContainer}
						dangerouslySetInnerHTML={{ __html: filter }}
					></span>
				</IconOnlyButton>
			</div>
		</section>
	);
};
