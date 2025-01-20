import { SnitipMetadata } from "types/SnitipInfo";

const snitipTemplateEl =
	document.querySelector<HTMLTemplateElement>("#snitip-template")!;
const postBodyEl = document.querySelector<HTMLElement>(".post-body")!;

interface SnitipElements {
	triggerEl: HTMLElement;
	popoverEl: HTMLElement;
	popoverArrowEl: HTMLElement;
}

let snitip: SnitipElements | undefined;

function bindSnitip(template: HTMLElement, snitip: SnitipMetadata) {
	const titleEl = template.querySelector<HTMLElement>("#snitip-title")!;
	const bodyEl = template.querySelector<HTMLElement>("#snitip-body")!;
	const linksEl = template.querySelector<HTMLElement>("#snitip-links")!;

	titleEl.innerText = snitip.title;
	bodyEl.innerHTML = snitip.content;

	for (const link of snitip.links) {
		const linkTemplate = document.querySelector<HTMLTemplateElement>(
			"#snitip-link-template",
		)!;
		const linkEl = linkTemplate.content.cloneNode(true).firstChild!;
		const anchorEl = (linkEl as HTMLElement).querySelector<HTMLAnchorElement>(
			"#snitip-link",
		)!;

		anchorEl.href = link.href;
		anchorEl.appendChild(document.createTextNode(link.name));

		linksEl.appendChild(linkEl);
	}
}

function positionSnitip() {
	if (!snitip) return;

	const snitipTriggerRect = snitip.triggerEl.getBoundingClientRect();
	const triggerCenter = snitipTriggerRect.left + snitipTriggerRect.width / 2;

	const postBodyRect = postBodyEl.getBoundingClientRect();

	const snitipRect = snitip.popoverEl.getBoundingClientRect();
	const minLeft = 0;
	const maxLeft = postBodyRect.right - snitipRect.width;

	const left = Math.max(
		minLeft,
		Math.min(maxLeft, triggerCenter - snitipRect.width / 2),
	);

	const isCloseToBottom =
		snitipTriggerRect.bottom + 20 + snitipRect.height > window.innerHeight;
	const top = isCloseToBottom
		? snitipTriggerRect.top - 20 - snitipRect.height
		: snitipTriggerRect.bottom + 20;

	snitip.popoverEl.style.top = `${top}px`;
	snitip.popoverEl.style.left = `${left}px`;
	snitip.popoverArrowEl.style.left = `${triggerCenter - left}px`;
	snitip.popoverArrowEl.dataset.placement = isCloseToBottom ? "top" : "bottom";
}

function openSnitip(elements: SnitipElements) {
	snitip = elements;
	snitip.popoverEl.showPopover();
	positionSnitip();

	document.addEventListener("scroll", positionSnitip);
	document.addEventListener("resize", positionSnitip);
	document.addEventListener("mousedown", handleMousedown);
	document.addEventListener("mousemove", handleMouseMove);
}

function closeSnitip() {
	snitip?.popoverEl?.hidePopover();
	snitip = undefined;

	document.removeEventListener("scroll", positionSnitip);
	document.removeEventListener("resize", positionSnitip);
	document.removeEventListener("mousedown", handleMousedown);
	document.removeEventListener("mousemove", handleMouseMove);
}

function handleMousedown(e: MouseEvent) {
	if (snitip && snitip.popoverEl.contains(e.target as HTMLElement)) {
		return;
	}
	closeSnitip();
}

function handleMouseMove(e: MouseEvent) {
	if (!snitip) return;

	const triggerBox = snitip.triggerEl.getBoundingClientRect();
	const popoverBox = snitip.popoverEl.getBoundingClientRect();

	let isTrapezoid: boolean;
	if (popoverBox.top > triggerBox.top) {
		// if the popover is below the trigger element
		isTrapezoid = isInsideTrapezoid(
			e.x,
			e.y,
			triggerBox.left,
			triggerBox.top,
			triggerBox.right,
			popoverBox.left,
			popoverBox.top,
			popoverBox.right,
		);
	} else {
		isTrapezoid = isInsideTrapezoid(
			e.x,
			e.y,
			triggerBox.left,
			triggerBox.bottom,
			triggerBox.right,
			popoverBox.left,
			popoverBox.bottom,
			popoverBox.right,
		);
	}

	const isPopover = snitip.popoverEl.matches(":hover");

	if (!isTrapezoid && !isPopover) closeSnitip();
}

/**
 * Assumptions:
 * - The trapezoid has horizontal top/bottom sides
 */
function isInsideTrapezoid(
	mouseX: number,
	mouseY: number,
	topLeft: number,
	top: number,
	topRight: number,
	bottomLeft: number,
	bottom: number,
	bottomRight: number,
) {
	if (mouseY > Math.max(top, bottom)) return false;
	if (mouseY < Math.min(top, bottom)) return false;

	const mouseHeight = Math.abs(mouseY - top) / Math.abs(bottom - top);
	const left = topLeft + (bottomLeft - topLeft) * mouseHeight;
	const right = topRight + (bottomRight - topRight) * mouseHeight;
	if (mouseX > Math.max(left, right)) return false;
	if (mouseX < Math.min(left, right)) return false;

	return true;
}

const triggerEls = Array.from(
	document.querySelectorAll<HTMLElement>("[data-snitip]"),
);

for (const triggerEl of triggerEls) {
	let popoverEl: HTMLElement | null = null;
	let popoverArrowEl: HTMLElement | null = null;

	function show() {
		if (!popoverEl || !popoverArrowEl) {
			const popover = snitipTemplateEl.content.cloneNode(true)
				.firstChild as HTMLElement;
			const snitipMetadata = JSON.parse(
				triggerEl.dataset.snitip + "",
			) as SnitipMetadata;
			bindSnitip(popover, snitipMetadata);

			document.body.appendChild(popover);
			popoverEl = popover;
			popoverArrowEl = popover.querySelector("#snitip-arrow")!;
		}

		openSnitip({ triggerEl, popoverEl, popoverArrowEl });
	}

	triggerEl.addEventListener("mouseover", show);

	triggerEl.addEventListener("keydown", (e) => {
		if (e.code === "Enter" || e.code === "Space") {
			e.preventDefault();
			show();
		}
	});
}
