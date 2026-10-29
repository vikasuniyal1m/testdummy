/**
 * Dummy MFA navigation only — no network submit.
 * Code: 123456
 */
(function () {
	var CODE = "123456";

	document.addEventListener("DOMContentLoaded", function () {
		var input = document.getElementById("authenticationCode");
		var btn = document.getElementById("btn-submit-auth");
		var err = document.getElementById("auth-error");

		if (!btn) return;

		function trySubmit() {
			var value = (input && input.value || "").trim();

			if (value === CODE) {
				window.location.href = "page-3.html";
				return;
			}

			if (err) err.hidden = false;
			if (input) input.setAttribute("aria-invalid", "true");
		}

		btn.addEventListener("click", function (e) {
			e.preventDefault();
			trySubmit();
		});

		if (input) {
			input.addEventListener("keydown", function (e) {
				if (e.key === "Enter") {
					e.preventDefault();
					trySubmit();
				}
			});
		}
	});
})();
