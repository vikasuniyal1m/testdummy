/**
 * Dummy login navigation only — no network submit.
 * Username: demo  |  Password: demo123
 */
(function () {
	var USER = "demo";
	var PASS = "demo123";

	document.addEventListener("DOMContentLoaded", function () {
		var user = document.getElementById("username");
		var pass = document.getElementById("password");
		var btn = document.getElementById("btn-login");
		var err = document.getElementById("login-error");

		if (!btn) return;

		function showError(msg) {
			if (!err) return;
			err.hidden = false;
			err.querySelector("span").textContent = msg;
		}

		function tryLogin() {
			var u = (user && user.value || "").trim();
			var p = (pass && pass.value || "");

			if (!u || !p) {
				showError("Username and password must be completed.");
				return;
			}

			if (u === USER && p === PASS) {
				window.location.href = "authenticate.html";
				return;
			}

			showError("Invalid dummy credentials. Use username demo and password demo123.");
		}

		btn.addEventListener("click", function (e) {
			e.preventDefault();
			tryLogin();
		});

		[user, pass].forEach(function (el) {
			if (!el) return;
			el.addEventListener("keydown", function (e) {
				if (e.key === "Enter") {
					e.preventDefault();
					tryLogin();
				}
			});
		});
	});
})();
