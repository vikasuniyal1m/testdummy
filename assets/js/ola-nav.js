/**
 * OLA menubar dropdowns + related-link opens (UI demo only).
 */
(function () {
	document.addEventListener("DOMContentLoaded", function () {
		var menus = document.querySelectorAll(".ola-submenu");

		menus.forEach(function (menu) {
			var btn = menu.querySelector(".ola-menu-btn");
			if (!btn) return;

			btn.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				var open = menu.classList.contains("open");
				menus.forEach(function (m) {
					m.classList.remove("open");
					var b = m.querySelector(".ola-menu-btn");
					if (b) b.setAttribute("aria-expanded", "false");
				});
				if (!open) {
					menu.classList.add("open");
					btn.setAttribute("aria-expanded", "true");
				}
			});
		});

		document.addEventListener("click", function () {
			menus.forEach(function (m) {
				m.classList.remove("open");
				var b = m.querySelector(".ola-menu-btn");
				if (b) b.setAttribute("aria-expanded", "false");
			});
		});

		document.querySelectorAll("[data-ext-url]").forEach(function (el) {
			el.addEventListener("click", function (e) {
				e.preventDefault();
				var url = el.getAttribute("data-ext-url");
				if (url) window.open(url, "_blank", "noopener,noreferrer");
			});
		});
	});
})();
