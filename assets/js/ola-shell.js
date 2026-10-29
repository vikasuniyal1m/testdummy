(function () {
	"use strict";

	var accountForm = document.querySelector("form.wc-application");
	if (!accountForm) return;

	var header = accountForm.querySelector("#_0a0");
	var navigation = accountForm.querySelector("#_0a1");
	if (!header || !navigation) {
		console.error("Could not apply the shared site header: the account header or navigation is missing.");
		return;
	}

	var standardHeader = document.createElement("header");
	standardHeader.className = "site-standard-header";
	standardHeader.setAttribute("role", "banner");
	standardHeader.innerHTML = '<div><h1>ImmiAccount</h1></div>';

	var standardNavigation = document.createElement("nav");
	standardNavigation.className = "site-nav";
	standardNavigation.setAttribute("aria-label", "Site");
	standardNavigation.innerHTML = '<ul><li><a href="login.html">Login</a></li><li><a href="help.html">Help</a></li><li><a href="create-account.html">Create account</a></li></ul>';

	standardHeader.appendChild(standardNavigation);
	header.replaceWith(standardHeader);
	navigation.remove();
}());
