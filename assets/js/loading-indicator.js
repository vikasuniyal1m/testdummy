(function () {
	"use strict";

	var duration = 3500;
	var storageKey = "demo-page-loading-until";
	var indicator = document.createElement("div");
	var style = document.createElement("style");
	var timer = 0;

	indicator.id = "page-loading-indicator";
	indicator.setAttribute("role", "status");
	indicator.setAttribute("aria-live", "polite");
	indicator.setAttribute("aria-label", "Loading");
	indicator.innerHTML = '<span class="page-loading-indicator__bar"></span><span class="page-loading-indicator__text">Loading</span>';

	style.textContent = [
		"#page-loading-indicator{position:fixed;inset:0 0 auto;z-index:2147483647;height:3px;opacity:0;pointer-events:none;transition:opacity .18s ease}",
		"#page-loading-indicator.is-visible{opacity:1}",
		"#page-loading-indicator .page-loading-indicator__bar{display:block;width:100%;height:100%;transform:scaleX(0);transform-origin:left center;background:#d88b32;box-shadow:0 0 5px rgba(216,139,50,.3)}",
		"#page-loading-indicator.is-visible .page-loading-indicator__bar{animation:page-loading-progress 3.5s ease-out both}",
		"#page-loading-indicator .page-loading-indicator__text{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
		"@keyframes page-loading-progress{0%{transform:scaleX(.04)}65%{transform:scaleX(.78)}100%{transform:scaleX(1)}}",
		"@media(prefers-reduced-motion:reduce){#page-loading-indicator .page-loading-indicator__bar{animation:none;transform:scaleX(1)}}"
	].join("");

	document.head.appendChild(style);
	document.documentElement.appendChild(indicator);

	function showUntil(expiresAt) {
		var remaining = expiresAt - Date.now();
		if (remaining <= 0) return;

		window.clearTimeout(timer);
		indicator.classList.remove("is-visible");
		void indicator.offsetWidth;
		indicator.classList.add("is-visible");
		timer = window.setTimeout(function () {
			indicator.classList.remove("is-visible");
			sessionStorage.removeItem(storageKey);
		}, remaining);
	}

	function show() {
		var expiresAt = Date.now() + duration;
		sessionStorage.setItem(storageKey, String(expiresAt));
		showUntil(expiresAt);
	}

	document.addEventListener("click", show, true);
	window.addEventListener("popstate", show);
	window.addEventListener("pageshow", function (event) {
		if (event.persisted) {
			show();
			return;
		}
		var expiresAt = Number(sessionStorage.getItem(storageKey));
		if (Number.isFinite(expiresAt)) showUntil(expiresAt);
	});

	var pendingExpiry = Number(sessionStorage.getItem(storageKey));
	var navigationEntries = performance.getEntriesByType("navigation");
	if (navigationEntries.length && navigationEntries[0].type === "back_forward") {
		show();
	} else if (Number.isFinite(pendingExpiry)) {
		showUntil(pendingExpiry);
	}
}());
