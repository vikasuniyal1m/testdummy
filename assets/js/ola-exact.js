/**
 * Local behaviour for the fictional applications / payments demo.
 */
(function () {
	var demoData = null;

	function showDemoDataError(error) {
		var message = document.getElementById("demo-data-error");
		if (!message) {
			message = document.createElement("p");
			message.id = "demo-data-error";
			message.className = "import-demo-note";
			message.setAttribute("role", "alert");
			var form = document.querySelector("form");
			document.body.insertBefore(message, form || document.body.firstChild);
		}
		var details = " Start the local JSON-writing server with \"python local-demo-server.py\" and open http://127.0.0.1:8767/.";
		message.textContent = "Demo data could not be loaded: " + error.message + "." + details;
	}

	function loadDemoData() {
		return fetch("/api/demo-applications", { cache: "no-store" }).then(function (response) {
			if (!response.ok) throw new Error("HTTP " + response.status);
			return response.json();
		}).then(function (data) {
			if (!data || !data.profile || typeof data.profile.displayName !== "string" || !Array.isArray(data.applications)) {
				throw new Error("the JSON file has an invalid format");
			}
			var validRecords = data.applications.every(function (record) {
				return record &&
					typeof record.id === "string" &&
					typeof record.applicantName === "string" &&
					typeof record.applicationType === "string" &&
					typeof record.status === "string" &&
					typeof record.referenceNumber === "string" &&
					typeof record.dateOfBirth === "string" &&
					typeof record.passportNumber === "string" &&
					typeof record.passportCountry === "string" &&
					typeof record.passportCountryCode === "string" &&
					typeof record.applicationTypeCode === "string" &&
					(record.demoMessages === undefined || (
						Array.isArray(record.demoMessages) &&
						record.demoMessages.every(function (message) {
							return message &&
								typeof message.date === "string" &&
								typeof message.subject === "string" &&
								typeof message.body === "string";
						})
					)) &&
					(record.demoCorrespondenceEmail === undefined || typeof record.demoCorrespondenceEmail === "string") &&
					(record.demoCorrespondence === undefined || (
						Array.isArray(record.demoCorrespondence) &&
						record.demoCorrespondence.every(function (item) {
							return item &&
								typeof item.title === "string" &&
									typeof item.date === "string" &&
									(item.url === undefined || typeof item.url === "string");
						})
					)) &&
					(record.applicationStatus === undefined || typeof record.applicationStatus === "string") &&
					(record.applicantStatus === undefined || typeof record.applicantStatus === "string") &&
					(record.importantInformation === undefined || typeof record.importantInformation === "string") &&
					(record.demoHistory === undefined || (
						Array.isArray(record.demoHistory) &&
						record.demoHistory.every(function (item) {
							return item &&
								typeof item.type === "string" &&
								typeof item.date === "string" &&
								typeof item.action === "string";
						})
					)) &&
					(record.demoUpdates === undefined || (
						Array.isArray(record.demoUpdates) &&
						record.demoUpdates.every(function (update) {
							return update &&
								typeof update.type === "string" &&
								typeof update.applicant === "string" &&
								typeof update.status === "string" &&
								typeof update.date === "string" &&
								typeof update.action === "string" &&
								(update.actionUrl === undefined || typeof update.actionUrl === "string") &&
								(update.actionLabel === undefined || typeof update.actionLabel === "string");
						})
					)) &&
					(record.demoBiometrics === undefined || (
						record.demoBiometrics &&
						typeof record.demoBiometrics.status === "string" &&
						typeof record.demoBiometrics.message === "string"
					)) &&
					(record.demoRecordDetails === undefined || (
						record.demoRecordDetails &&
						[
							"applicantName", "grantDate", "visaSubclass", "stream", "status",
							"mustNotArriveAfter", "lengthOfStay", "travelType", "dob",
							"grantNumber", "passportNumber", "passportCountry", "applicationId",
							"trn", "officerName", "positionNumber", "sentToEmail", "sentOnDate"
						].every(function (key) {
							return typeof record.demoRecordDetails[key] === "string";
						})
					));
			});
//			if (!validRecords) throw new Error("one or more demo records are incomplete");
//			demoData = data;
//			document.querySelectorAll("header .wc-text-type-plain").forEach(function (name) {
//				name.textContent = data.profile.displayName;
//			});
//			return data;
		});
	}

	function renderApplications(data, filter) {
		var results = document.querySelector("#MyAppsResultsPanel .wc-content");
		if (!results) return;
		results.textContent = "";
		var query = (filter || "").trim().toLowerCase();
		var records = data.applications.filter(function (record) {
			return !query || [
				record.applicantName,
				record.applicationType,
				record.status,
				record.referenceNumber,
				record.applicationId
			].join(" ").toLowerCase().indexOf(query) !== -1;
		});
		if (!records.length) {
			results.textContent = "No demo applications match your search.";
			return;
		}
		var list = document.createElement("div");
		list.className = "demo-applications";
		records.forEach(function (record) {
			var card = document.createElement("article");
			card.className = "demo-app-card";
			var title = document.createElement("h2");
			title.textContent = record.applicationType;
			card.appendChild(title);
			[
				["Applicant", record.applicantName],
				["Status", record.status],
				["Reference number", record.referenceNumber],
				["Date of birth", record.dateOfBirth],
				["Travel document", record.passportNumber + " — " + record.passportCountry]
			].forEach(function (item) {
				var line = document.createElement("p");
				var label = document.createElement("strong");
				label.textContent = item[0] + ": ";
				line.appendChild(label);
				line.appendChild(document.createTextNode(item[1]));
				card.appendChild(line);
			});
			var link = document.createElement("a");
			link.href = "application-details.html?id=" + encodeURIComponent(record.id);
			link.textContent = "View demo details";
			card.appendChild(link);
			list.appendChild(card);
		});
		results.appendChild(list);
	}

	function renderApplicationDetails(data) {
		var output = document.getElementById("demo-detail-output");
		if (!output) return;
		var params = new URLSearchParams(window.location.search);
		var recordId = params.get("id");
		var view = params.get("view") || "home";
		var record = data.applications.find(function (item) { return item.id === recordId; });
		output.textContent = "";
		if (!record) {
			output.textContent = "No demo record selected. Choose a sample from My applications or use Import application.";
			return;
		}

		var views = {
			"home": "Application home",
			"messages": "Messages",
			"update-details": "Update details",
			"visa-grant-details": "Visa grant details",
			"attachments": "View attachments",
			"biometrics": "Biometrics collection"
		};
		var applicationHeading = document.getElementById("demo-application-heading");
		if (applicationHeading) {
			applicationHeading.textContent = "Fictional application — Travel document: " + record.passportNumber;
		}
		["demo-detail-nav", "demo-detail-actions"].forEach(function (navId) {
			var nav = document.getElementById(navId);
			if (!nav) return;
			nav.hidden = false;
			nav.querySelectorAll("[data-detail-view]").forEach(function (link) {
				var linkView = link.getAttribute("data-detail-view");
				link.href = "application-details.html?id=" + encodeURIComponent(record.id) + "&view=" + encodeURIComponent(linkView);
				if (linkView === view) {
					link.setAttribute("aria-current", "page");
					link.setAttribute("aria-label", views[linkView] + " (current section)");
				} else {
					link.removeAttribute("aria-current");
					link.removeAttribute("aria-label");
				}
			});
		});

		var note = document.createElement("p");
		note.className = "demo-record-note";
		note.textContent = "FICTIONAL DEMO RECORD — This is sample data for interface testing, not a real application or decision.";
		output.appendChild(note);
		var title = document.createElement("h2");
		title.className = "import-section-title";
		title.textContent = views[view] || "Application details";
		output.appendChild(title);

		if (!views[view]) {
			var invalidView = document.createElement("p");
			invalidView.textContent = "That demo section is not available. Choose a section from the navigation.";
			output.appendChild(invalidView);
			return;
		}

		if (view === "home") {
			var status = document.createElement("p");
			var statusLabel = document.createElement("strong");
			statusLabel.textContent = "Application status: ";
			status.appendChild(statusLabel);
			status.appendChild(document.createTextNode(record.applicationStatus || record.status));
			output.appendChild(status);

			var applicantsLabel = document.createElement("h3");
			applicantsLabel.textContent = "Applicants";
			output.appendChild(applicantsLabel);
			var applicants = document.createElement("ul");
			var applicant = document.createElement("li");
			applicant.textContent = record.applicantName +
				(record.dateOfBirth ? " (" + record.dateOfBirth + ")" : "") +
				" — " + (record.applicantStatus || record.status);
			applicants.appendChild(applicant);
			output.appendChild(applicants);

			var importedDetailsHeading = document.createElement("h3");
			importedDetailsHeading.textContent = "Imported demo details";
			output.appendChild(importedDetailsHeading);
			var importedDetails = document.createElement("dl");
			importedDetails.className = "demo-detail-list";
			[
				["Application type", record.applicationType],
				["Reference number", record.referenceNumber],
				["Date of birth", record.dateOfBirth],
				["Travel document", record.passportNumber + " — " + record.passportCountry],
				["Application ID", record.applicationId],
				["Transaction reference", record.transactionReference]
			].forEach(function (item) {
				var term = document.createElement("dt");
				term.textContent = item[0];
				var value = document.createElement("dd");
				value.textContent = item[1] || "—";
				importedDetails.appendChild(term);
				importedDetails.appendChild(value);
			});
			output.appendChild(importedDetails);

			var importantHeading = document.createElement("h3");
			importantHeading.className = "demo-important-heading";
			importantHeading.textContent = "Important information";
			output.appendChild(importantHeading);
			var importantText = document.createElement("p");
			importantText.textContent = record.importantInformation ||
				"This is a fictional sample. No application has been submitted, and no visa decision or receipt is issued.";
			output.appendChild(importantText);

			var historyHeading = document.createElement("h3");
			historyHeading.className = "demo-history-heading";
			historyHeading.textContent = "Application history";
			output.appendChild(historyHeading);
			var history = document.createElement("table");
			history.className = "demo-history";
			var historyHead = document.createElement("thead");
			var headingRow = document.createElement("tr");
			["Type", "Date", "Action"].forEach(function (text) {
				var cell = document.createElement("th");
				cell.scope = "col";
				cell.textContent = text;
				headingRow.appendChild(cell);
			});
			historyHead.appendChild(headingRow);
			history.appendChild(historyHead);
			var historyBody = document.createElement("tbody");
			var historyRecords = Array.isArray(record.demoHistory) && record.demoHistory.length
				? record.demoHistory
				: [{
					type: "Fictional demo application created",
					date: record.dateOfApplication || "—",
					action: "Demo record only"
				}];
			historyRecords.forEach(function (item) {
				var tableRow = document.createElement("tr");
				[item.type, item.date, item.action].forEach(function (text) {
					var cell = document.createElement("td");
					cell.textContent = text || "—";
					tableRow.appendChild(cell);
				});
				historyBody.appendChild(tableRow);
			});
			history.appendChild(historyBody);
			output.appendChild(history);
			return;
		}

		if (view === "messages") {
			var correspondenceNotice = document.createElement("p");
			correspondenceNotice.textContent =
				"Correspondence for this application is currently being sent to the Primary Applicant at the following email address: " +
				(record.demoCorrespondenceEmail || "demo@example.test");
			output.appendChild(correspondenceNotice);
			var spamNotice = document.createElement("p");
			spamNotice.textContent = "Please check your spam filter if you have not received any correspondence.";
			output.appendChild(spamNotice);

			var correspondence = Array.isArray(record.demoCorrespondence) && record.demoCorrespondence.length
				? record.demoCorrespondence
				: [
					{ title: "Fictional demo record received", date: record.dateOfApplication },
					{ title: "Fictional demo details update acknowledgement", date: record.dateOfApplication },
					{ title: "Fictional demo message", date: record.dateOfApplication }
				];
			var correspondenceTitle = document.createElement("h3");
			correspondenceTitle.textContent = "List of correspondence (fictional demo)";
			output.appendChild(correspondenceTitle);

			var correspondenceTable = document.createElement("table");
			correspondenceTable.className = "demo-history";
			var correspondenceHead = document.createElement("thead");
			var correspondenceHeadingRow = document.createElement("tr");
			["Correspondence title", "Date sent", "Email"].forEach(function (text) {
				var cell = document.createElement("th");
				cell.scope = "col";
				cell.textContent = text;
				correspondenceHeadingRow.appendChild(cell);
			});
			correspondenceHead.appendChild(correspondenceHeadingRow);
			correspondenceTable.appendChild(correspondenceHead);

			var correspondenceBody = document.createElement("tbody");
			correspondence.forEach(function (item) {
				var row = document.createElement("tr");
				var titleCell = document.createElement("td");
				var pageLink = document.createElement("a");
				pageLink.href = item.url || "/pages/gemini-code-1793220976142.html?id=" + encodeURIComponent(record.id);
				pageLink.textContent = item.title;
				pageLink.title = "Local demo page.";
				pageLink.target = "_blank";
				pageLink.rel = "noopener";
				titleCell.appendChild(pageLink);
				var dateCell = document.createElement("td");
				dateCell.textContent = item.date || "—";
				var emailCell = document.createElement("td");
				emailCell.textContent = record.demoCorrespondenceEmail || "demo@example.test";
				row.appendChild(titleCell);
				row.appendChild(dateCell);
				row.appendChild(emailCell);
				correspondenceBody.appendChild(row);
			});
			correspondenceTable.appendChild(correspondenceBody);
			output.appendChild(correspondenceTable);
			return;
		}

		if (view === "attachments") {
			var attachments = document.createElement("p");
			attachments.textContent = "No attachments are included with this fictional demo record.";
			output.appendChild(attachments);
			return;
		}

		if (view === "biometrics") {
			var biometricsStatus = document.createElement("p");
			biometricsStatus.textContent = record.demoBiometrics
				? record.demoBiometrics.status
				: "Not collected — fictional demo only";
			output.appendChild(biometricsStatus);
			var biometricsMessage = document.createElement("p");
			biometricsMessage.textContent = record.demoBiometrics
				? record.demoBiometrics.message
				: "No appointment or biometric record exists for this demo.";
			output.appendChild(biometricsMessage);
			return;
		}

		if (view === "visa-grant-details" && !record.dateOfGrant &&
			!record.demoRecordDetails && record.status !== "Local demo record — not submitted") {
			var noGrant = document.createElement("p");
			noGrant.textContent = "Visa grant details are not available for this fictional sample.";
			output.appendChild(noGrant);
			return;
		}

		if (view === "update-details") {
			var updateIntro = document.createElement("p");
			updateIntro.textContent = "This fictional demo shows sample update categories only. No information is sent to any department.";
			output.appendChild(updateIntro);

			var updateOptions = document.createElement("ul");
			[
				"Change of address details",
				"Change of contact telephone numbers",
				"Change of email address details",
				"Change of passport details",
				"Request to cancel a temporary resident visa"
			].forEach(function (text) {
				var item = document.createElement("li");
				item.textContent = text;
				updateOptions.appendChild(item);
			});
			output.appendChild(updateOptions);

			var updatesTitle = document.createElement("h3");
			updatesTitle.textContent = "List of updates provided (fictional demo)";
			output.appendChild(updatesTitle);
			if (Array.isArray(record.demoUpdates) && record.demoUpdates.length) {
				var updatesTable = document.createElement("table");
				updatesTable.className = "demo-history";
				var updatesHead = document.createElement("thead");
				var updatesHeadingRow = document.createElement("tr");
				["Client", "Status", "Action"].forEach(function (text) {
					var cell = document.createElement("th");
					cell.scope = "col";
					cell.textContent = text;
					updatesHeadingRow.appendChild(cell);
				});
				updatesHead.appendChild(updatesHeadingRow);
				updatesTable.appendChild(updatesHead);

				var updatesBody = document.createElement("tbody");
				record.demoUpdates.forEach(function (update) {
					var row = document.createElement("tr");
					var client = document.createElement("td");
					var updateType = document.createElement("strong");
					updateType.textContent = update.type;
					client.appendChild(updateType);
					client.appendChild(document.createElement("br"));
					client.appendChild(document.createTextNode(update.applicant ||
						record.applicantName + (record.dateOfBirth ? " (" + record.dateOfBirth + ")" : "")
					));

					var status = document.createElement("td");
					status.textContent = update.status + (update.date ? " — " + update.date : "");

					var action = document.createElement("td");
					if (update.actionUrl && update.actionLabel) {
						var actionLink = document.createElement("a");
						actionLink.href = update.actionUrl;
						actionLink.textContent = update.actionLabel;
						actionLink.target = "_blank";
						actionLink.rel = "noopener";
						action.appendChild(actionLink);
					} else if (update.actionUrl === "file:///E:/Downloads/gemini-code-1793220976142.html") {
						var demoFileLink = document.createElement("a");
						demoFileLink.href = update.actionUrl;
						demoFileLink.textContent = "Open demo page (local HTML)";
						demoFileLink.title = "Local fictional demo HTML file; not a PDF or official document.";
						demoFileLink.target = "_blank";
						demoFileLink.rel = "noopener";
						action.appendChild(demoFileLink);
					} else {
						action.textContent = update.action || "Fictional demo record — no document available.";
					}
					row.appendChild(client);
					row.appendChild(status);
					row.appendChild(action);
					updatesBody.appendChild(row);
				});
				updatesTable.appendChild(updatesBody);
				output.appendChild(updatesTable);
			} else {
				var noUpdates = document.createElement("p");
				noUpdates.textContent = "No fictional demo updates are available for this record.";
				output.appendChild(noUpdates);
			}
			return;
		}

		var rows = view === "visa-grant-details" ? [] : [["Applicant", record.applicantName]];

		if (view === "update-details") {
			rows.push(
				["Date of birth", record.dateOfBirth],
				["Travel document", record.passportNumber + " — " + record.passportCountry]
			);
		} else if (view === "visa-grant-details") {
			var grantDetails = record.demoRecordDetails || {
				applicantName: record.applicantName,
				grantDate: record.dateOfGrant || "Not issued — local demo only",
				visaSubclass: record.applicationType + " — demo only",
				stream: record.stream || "Local demo only",
				status: record.status + " — demo only",
				mustNotArriveAfter: record.mustNotArriveAfter || "Not applicable — no visa granted",
				lengthOfStay: record.lengthOfStay || "Not applicable — no visa granted",
				travelType: record.travel || "Not applicable — no visa granted",
				dob: record.dateOfBirth,
				grantNumber: "Not issued — local demo only",
				passportNumber: record.passportNumber,
				passportCountry: record.passportCountry,
				applicationId: record.applicationId,
				trn: record.transactionReference,
				officerName: "Not applicable — no official decision",
				positionNumber: "Not applicable — no official decision",
				sentToEmail: record.demoCorrespondenceEmail || "demo@example.test",
				sentOnDate: "Not sent — local demo only"
			};
			[
				["Applicant", grantDetails.applicantName],
				["Grant date", grantDetails.grantDate],
				["Visa subclass", grantDetails.visaSubclass],
				["Stream", grantDetails.stream],
				["Status", grantDetails.status],
				["Must not arrive after", grantDetails.mustNotArriveAfter],
				["Length of stay", grantDetails.lengthOfStay],
				["Travel type", grantDetails.travelType],
				["Date of birth", grantDetails.dob],
				["Grant number", grantDetails.grantNumber],
				["Passport number", grantDetails.passportNumber],
				["Passport country", grantDetails.passportCountry],
				["Application ID", grantDetails.applicationId],
				["TRN", grantDetails.trn],
				["Officer name", grantDetails.officerName],
				["Position number", grantDetails.positionNumber],
				["Sent to email", grantDetails.sentToEmail],
				["Sent on date", grantDetails.sentOnDate]
			].forEach(function (item) {
				rows.push(item);
			});
		} else {
			rows.push(
				["Date of birth", record.dateOfBirth],
				["Application type", record.applicationType],
				["Stream", record.stream],
				["Status", record.status],
				["Date of application", record.dateOfApplication],
				["Reference number", record.referenceNumber],
				["Application ID", record.applicationId],
				["Transaction reference", record.transactionReference],
				["Travel document", record.passportNumber + " — " + record.passportCountry]
			);
			if (record.dateOfGrant) {
				rows.push(
					["Date of grant", record.dateOfGrant],
					["Must not arrive after", record.mustNotArriveAfter],
					["Length of stay", record.lengthOfStay],
					["Travel", record.travel]
				);
			}
		}

		var table = document.createElement("dl");
		table.className = "demo-detail-list";
		rows.forEach(function (row) {
			var term = document.createElement("dt");
			term.textContent = row[0];
			var value = document.createElement("dd");
			value.textContent = row[1];
			table.appendChild(term);
			table.appendChild(value);
		});
		output.appendChild(table);
		if (view === "visa-grant-details" && record.conditions && record.conditions.length) {
			var conditionsTitle = document.createElement("h2");
			conditionsTitle.className = "import-section-title";
			conditionsTitle.textContent = "Fictional demo conditions";
			output.appendChild(conditionsTitle);
			var conditions = document.createElement("ul");
			record.conditions.forEach(function (condition) {
				var item = document.createElement("li");
				item.textContent = condition;
				conditions.appendChild(item);
			});
			output.appendChild(conditions);
		}
	}

	document.addEventListener("DOMContentLoaded", function () {
		var needsDemoData = document.querySelector("header .wc-text-type-plain, #MyAppsResultsPanel, #demo-detail-output, #import-form");
		var demoDataPromise = needsDemoData
			? loadDemoData().catch(function (error) {
				showDemoDataError(error);
				return null;
			})
			: Promise.resolve(null);

		var logout = document.getElementById("_0a0a2");
		if (logout) {
			logout.addEventListener("click", function () {
				window.location.href = "login.html";
			});
		}

		var manage = document.getElementById("_0a0a1");
		if (manage) {
			manage.addEventListener("click", function () {
				window.location.href = "applications.html";
			});
		}

		document.querySelectorAll("[data-goto]").forEach(function (el) {
			el.addEventListener("click", function (e) {
				e.preventDefault();
				var target = el.getAttribute("data-goto");
				if (target) window.location.href = target;
			});
		});

		var myApps = document.getElementById("_0a1a0");
		if (myApps) {
			myApps.addEventListener("click", function (e) {
				e.preventDefault();
				window.location.href = "applications.html";
			});
		}

		var importApp = document.getElementById("btn_importapp");
		if (importApp) {
			importApp.addEventListener("click", function () {
				window.location.href = "import-application.html";
			});
		}

		var cancelImport = document.getElementById("import-cancel");
		if (cancelImport) {
			cancelImport.addEventListener("click", function () {
				window.location.href = "applications.html";
			});
		}

		var importForm = document.getElementById("import-form");
		if (importForm) {
			importForm.addEventListener("submit", function (e) {
				e.preventDefault();
				if (!importForm.reportValidity()) return;
				var feedback = document.getElementById("demo-form-feedback");
				if (!demoData) {
					feedback.hidden = false;
					feedback.textContent = "Demo data is not ready yet. Reload the page and try again.";
					return;
				}
				var applicationType = document.getElementById("i_apptypedd_input");
				var country = document.getElementById("i_cntryppdd_input");
				var payload = {
					applicantName: demoData.profile.displayName,
					applicationType: applicationType.options[applicationType.selectedIndex].text,
					applicationTypeCode: applicationType.value,
					referenceNumber: document.getElementById("i_refno_input").value.trim(),
					dateOfBirth: document.getElementById("i_dobdt_input").value.trim(),
					passportNumber: document.getElementById("i_ppno_input").value.trim(),
					passportCountryCode: country.value,
					passportCountry: country.options[country.selectedIndex].text
				};
				feedback.hidden = false;
				feedback.textContent = "Saving this fictional record to the local JSON file...";
				fetch("/api/demo-applications", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				}).then(function (response) {
					return response.text().then(function (body) {
						var result;
						try {
							result = JSON.parse(body);
						} catch (error) {
							throw new Error("The local demo server returned an invalid response (HTTP " + response.status + ").");
						}
						if (!response.ok) throw new Error(result.error || "HTTP " + response.status);
						return result;
					});
				}).then(function (result) {
					window.location.href = "application-details.html?id=" + encodeURIComponent(result.id);
				}).catch(function (error) {
					feedback.hidden = false;
					feedback.textContent = "The fictional record could not be saved: " + error.message;
				});
			});
		}

		var managePay = document.getElementById("_0a1a1b0");
		if (managePay && !managePay.getAttribute("data-goto")) {
			managePay.addEventListener("click", function (e) {
				e.preventDefault();
				window.location.href = "manage-payments.html";
			});
		}
		var payInv = document.getElementById("_0a1a1b1");
		if (payInv && !payInv.getAttribute("data-goto")) {
			payInv.addEventListener("click", function (e) {
				e.preventDefault();
				window.location.href = "pay-invoice.html";
			});
		}

		document.querySelectorAll(".wc_closesubmenu").forEach(function (el) {
			el.addEventListener("click", function (e) {
				e.preventDefault();
				var menu = el.closest(".wc-submenu");
				if (!menu) return;
				menu.classList.remove("open");
				var p = menu.querySelector(".wc_submenucontent");
				var b = menu.querySelector(".wc-submenu-o");
				if (p) p.setAttribute("aria-expanded", "false");
				if (b) b.setAttribute("aria-pressed", "false");
			});
		});

		document.querySelectorAll(".wc-submenu").forEach(function (menu) {
			var btn = menu.querySelector(".wc-submenu-o");
			var panel = menu.querySelector(".wc_submenucontent");
			if (!btn || !panel) return;

			/* Always start closed — options only inside dropdown */
			menu.classList.remove("open");
			panel.setAttribute("aria-expanded", "false");
			btn.setAttribute("aria-pressed", "false");

			btn.addEventListener("click", function (e) {
				e.preventDefault();
				e.stopPropagation();
				var willOpen = !menu.classList.contains("open");
				document.querySelectorAll(".wc-submenu").forEach(function (m) {
					m.classList.remove("open");
					var p = m.querySelector(".wc_submenucontent");
					var b = m.querySelector(".wc-submenu-o");
					if (p) p.setAttribute("aria-expanded", "false");
					if (b) b.setAttribute("aria-pressed", "false");
				});
				if (willOpen) {
					menu.classList.add("open");
					panel.setAttribute("aria-expanded", "true");
					btn.setAttribute("aria-pressed", "true");
				}
			});

			/* Clicks inside dropdown should not close it immediately */
			panel.addEventListener("click", function (e) {
				e.stopPropagation();
			});
		});

		document.addEventListener("click", function () {
			document.querySelectorAll(".wc-submenu").forEach(function (m) {
				m.classList.remove("open");
				var p = m.querySelector(".wc_submenucontent");
				var b = m.querySelector(".wc-submenu-o");
				if (p) p.setAttribute("aria-expanded", "false");
				if (b) b.setAttribute("aria-pressed", "false");
			});
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape") {
				document.querySelectorAll(".wc-submenu").forEach(function (m) {
					m.classList.remove("open");
				});
			}
		});

		document.querySelectorAll("[data-wc-url]").forEach(function (el) {
			el.addEventListener("click", function (e) {
				e.preventDefault();
				var url = el.getAttribute("data-wc-url");
				if (url) window.open(url, "_blank", "noopener,noreferrer");
			});
		});

		var openAdv = document.getElementById("id_srccritpanoutersrcpan_1a3a");
		var closeAdv = document.getElementById("btn-close-adv");
		var advPanel = document.getElementById("id_srccritpanoutersrcpan_0");
		var instantRow = document.getElementById("id_srccritpanoutersrcpan_1a");

		function showAdvanced(show) {
			if (!advPanel) return;
			advPanel.hidden = !show;
			if (instantRow) instantRow.style.display = show ? "none" : "";
			if (openAdv) openAdv.style.display = show ? "none" : "";
		}

		if (openAdv) openAdv.addEventListener("click", function () { showAdvanced(true); });
		if (closeAdv) closeAdv.addEventListener("click", function () { showAdvanced(false); });

		var clearBtn = document.getElementById("btn-clear-adv");
		if (clearBtn && advPanel) {
			clearBtn.addEventListener("click", function () {
				advPanel.querySelectorAll("input[type='text']").forEach(function (el) { el.value = ""; });
				advPanel.querySelectorAll("select").forEach(function (el) { el.selectedIndex = 0; });
				var all = advPanel.querySelector('input[name="actionReq"][value="all"]');
				if (all) all.checked = true;
			});
		}

		var searchBtn = document.getElementById("btn-search-adv");
		var instantSearchBtn = document.getElementById("btn_perform_instant_srch");
		var refreshBtn = document.getElementById("i_refreshButton");
		var results = document.querySelector("#MyAppsResultsPanel .wc-content");
		var instantSearch = document.getElementById("i_instantSearchFld_input");
		function showNoResults() {
			if (results && demoData) renderApplications(demoData, instantSearch ? instantSearch.value : "");
		}
		if (searchBtn) searchBtn.addEventListener("click", showNoResults);
		if (instantSearchBtn) instantSearchBtn.addEventListener("click", showNoResults);
		if (refreshBtn) refreshBtn.addEventListener("click", function () {
			if (instantSearch) instantSearch.value = "";
			showNoResults();
		});
		demoDataPromise.then(function (data) {
			if (!data) return;
			if (document.getElementById("MyAppsResultsPanel")) renderApplications(data, "");
			renderApplicationDetails(data);
		});

		var payAdv = document.getElementById("pay-advanced");
		var payOpen = document.getElementById("btn_pay_adv");
		var payClose = document.getElementById("btn_pay_close_adv");
		var paySearchRow = document.querySelector(".ola-search-row-simple");

		function showPayAdv(show) {
			if (!payAdv) return;
			payAdv.hidden = !show;
			if (paySearchRow) paySearchRow.style.display = show ? "none" : "";
		}
		if (payOpen) payOpen.addEventListener("click", function () { showPayAdv(true); });
		if (payClose) payClose.addEventListener("click", function () { showPayAdv(false); });

		var payBody = document.getElementById("paymentsBody");
		function resetPayTable() {
			if (payBody) {
				payBody.innerHTML = '<tr class="ola-empty-row"><td colspan="6">No results found</td></tr>';
			}
		}
		var payGo = document.getElementById("btn_pay_go");
		var payRefresh = document.getElementById("btn_pay_refresh");
		var paySearchBtn = document.getElementById("btn_pay_search");
		if (payGo) payGo.addEventListener("click", resetPayTable);
		if (payRefresh) payRefresh.addEventListener("click", resetPayTable);
		if (paySearchBtn) paySearchBtn.addEventListener("click", resetPayTable);

		var payClear = document.getElementById("btn_pay_clear");
		if (payClear && payAdv) {
			payClear.addEventListener("click", function () {
				payAdv.querySelectorAll("input[type='text']").forEach(function (el) { el.value = ""; });
				payAdv.querySelectorAll("select").forEach(function (el) { el.selectedIndex = 0; });
			});
		}

		var newPay = document.getElementById("btn_new_payment");
		if (newPay) {
			newPay.addEventListener("click", function () {
				window.location.href = "pay-invoice.html";
			});
		}
	});
})();
