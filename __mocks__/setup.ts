import "@testing-library/jest-dom/vitest";
import "jest-location-mock";
import { TextDecoder, TextEncoder } from "node:util";
import * as preact from "preact";
import { vi } from "vitest";

const history = [] as string[];

window.history.pushState = (_data, _unused, url: string) => {
	window.location.assign(url);
	history.push(url);
};

window.history.replaceState = (_data, _unused, url: string) => {
	window.location.assign(url);
	history[history.length - 1] = url;
};

window.history.back = () => {
	history.pop();
	window.location.assign(history[history.length - 1]);
};

// https://github.com/jsdom/jsdom/issues/3294

HTMLDialogElement.prototype.show = vi.fn(function mock(
	this: HTMLDialogElement,
) {
	this.open = true;
});

HTMLDialogElement.prototype.showModal = vi.fn(function mock(
	this: HTMLDialogElement,
) {
	this.open = true;
});

HTMLDialogElement.prototype.close = vi.fn(function mock(
	this: HTMLDialogElement,
) {
	this.open = false;
});

Object.defineProperties(globalThis, {
	// For the location mock package
	jest: { value: vi },
	// To trick our href-container-script to pass actual functions
	inTestSuite: { value: true },
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder },
	plausible: { value: null },
	React: { value: preact },
	CSS: { value: { supports: () => false } },
	IntersectionObserver: {
		value: class IntersectionObserver {
			constructor() {}

			observe() {
				return null;
			}

			disconnect() {
				return null;
			}

			unobserve() {
				return null;
			}
		},
	},
});
