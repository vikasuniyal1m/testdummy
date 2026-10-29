/**
 * Shared layout helpers for multi-page static UI.
 * Each page sets: <html data-root="..">  (from pages/) or data-root="." (from root)
 */
(function () {
	var root = document.documentElement.getAttribute("data-root") || ".";

	function path(rel) {
		return root.replace(/\/$/, "") + "/" + rel.replace(/^\//, "");
	}

	window.Site = {
		root: root,
		path: path,
		pages: {
			login: "pages/login.html",
			authenticate: "pages/authenticate.html",
			page3: "pages/page-3.html",
			applications: "pages/applications.html",
			managePayments: "pages/manage-payments.html",
			payInvoice: "pages/pay-invoice.html",
			sessionError: "pages/session-error.html",
			home: "pages/home.html",
			forgotUsername: "pages/forgot-username.html",
			forgotPassword: "pages/forgot-password.html",
			lostMfa: "pages/lost-mfa.html",
			createAccount: "pages/create-account.html",
			help: "pages/help.html"
		},
		href: function (key) {
			return path(this.pages[key] || key);
		}
	};

	document.addEventListener("DOMContentLoaded", function () {
		var links = document.querySelectorAll("[data-nav]");
		for (var i = 0; i < links.length; i++) {
			var key = links[i].getAttribute("data-nav");
			if (key && Site.pages[key]) {
				links[i].setAttribute("href", Site.href(key));
			}
		}
	});
})();
