setTimeout
(
	function()
	{
		var node = document.createElement("div");
		node.setAttribute("id", "session_container");
		node.setAttribute("role", "alert");
		node.setAttribute("aria-live", "polite");
		node.onclick = function() { node.innerHTML = ""; }
		document.body.appendChild(node);
		
		node.innerHTML = "<section class='messagebox warn closeable'><h1>Warning</h1>"
					   + "<button type='button'><span class='assistiveOnly'>Close warning message</span></button>"
					   + "<div class='message'>"
					   + "<strong>Warning</strong>"
					   + "<p>Your session will be automatically ended within the next 5 minutes.</p>"
					   + "<p>This is because the server has not registered any activity for some time.</p>"
					   + "<p>To reset your session timer you can do one of the following actions:</p>"
					   + "<ul>"
					   + "<li>save your work; or</li>"
					   + "<li>navigate to a different page.</li>"
					   + "</ul>"
					   + "</div></section>";
		
		node.getElementsByTagName("button")[0].onclick = node.onclick;

		setTimeout
		(
			function()
			{
				var node = document.getElementById("session_container");

				node.innerHTML = "<section class='messagebox error closeable'><h1>An error has occurred</h1>"
							   + "<button type='button'><span class='assistiveOnly'>Close error message</span></button>"
							   + "<div class='message'>"
							   + "<strong>Session Expired</strong>"
							   + "<p>Your session has expired.</p>"
							   + "<p>There may have been changes that were not saved.</p>"
							   + "<p>To start a new session you can do one of the following actions:</p>"
							   + "<ul>"
							   + "<li>navigate to the home page; or</li>"
							   + "<li>close this window and open a new application.</li>"
							   + "</ul>"
							   + "</div></section>";
				
				node.getElementsByTagName("button")[0].onclick = node.onclick;
			},
			5 * 60 * 1000
		);
	},
	(25 * 60 * 1000) - (30 * 1000)
);

function addStyleClass(el, clazz)
{
	if (el && el.className.split(" ").indexOf(clazz) == -1) 
	{
		el.className = el.className.length == 0 ? clazz : el.className + ' ' + clazz;
	}
}

function removeStyleClass(el, clazz)
{
	el.className = el.className.replace(new RegExp('(^|\\s)' + clazz + '(?!\\S)'), '');
}

function reParent(newParent, oldParent)
{
	while (oldParent.childNodes.length > 0) 
	{
		newParent.appendChild(oldParent.childNodes[0]);
	}
}

function cancelForm(el)
{
	if (el && el.form)
	{
		var fields = el.form.getElementsByTagName("input");
		var changed = el.form.getAttribute("data-unsaved");
		var i;

		if (!changed)
		{
			for (i = 0; i < fields.length; i++)
			{
				if 
				(
					(fields[i].type == "checkbox" && fields[i].defaultChecked != fields[i].checked)
					|| (fields[i].type == "radio" && fields[i].defaultChecked != fields[i].checked)
					|| (fields[i].value != fields[i].defaultValue)
				)
				{
					changed = true;
					break;
				}
			}
		}
		
		if (!changed)
		{
			fields = el.form.getElementsByTagName("textarea");
			
			for (i = 0; i < fields.length; i++)
			{
				if (fields[i].value != fields[i].defaultValue)
				{
					changed = true;
					break;
				}
			}
		}
		
		if (!changed)
		{
			fields = el.form.getElementsByTagName("select");
			
			for (i = 0; i < fields.length; i++)
			{
				if (fields[i].selectedIndex > -1 && fields[i].options[fields[i].selectedIndex].defaultSelected != fields[i].options[fields[i].selectedIndex].selected)
				{
					changed = true;
					break;
				}
			}			
		}		
	}
	
	return !changed || confirm("This page has unsaved changes. Would you like to discard them?");
}

function getInputValues(element)
{
	switch (element.tagName)
	{
		case "INPUT" :
		{
			switch(element.type) 
			{
				case "hidden" :
				case "email" :
				case "tel" :
				case "number" :
				case "text" :
				{
					return [element.value];
				}
				case "checkbox" :
				{
					var name = element.getAttribute("name");
					var boxes = document.getElementsByName(name);
					
					if (boxes)
					{
						var list = [];
						
						for (var i = 0; i < boxes.length; i++)
						{
							if (boxes[i].checked)
							{
								list.push(boxes[i].value);
							}
						}
						
						return list;
					}
					
					break;
				}
				case "radio" :
				{
					var name = element.getAttribute("name");
					var radios = document.getElementsByName(name);
					
					if (radios)
					{
						for (var i = 0; i < radios.length; i++)
						{
							if (radios[i].checked)
							{
								return [radios[i].value];
							}
						}
					}
					
					break;
				}
				default :
				{
					console.log("TODO general.getInputValues() element.type: " + element.type);
					
					return [element.value];
				}
			}
			break;
		}	
		case "SELECT" :
		{
			if (element.selectedIndex > -1)
			{
				var list = [];
				
				for (var k = element.selectedIndex; k < element.length; k++) 
				{
					if (element.options[k].selected)
					{
						list.push(element.options[k].value);
					}
				}
				
				return list;
			}
			
			break;
		}
		default :
		{
			console.log("TODO general.getInputValues() element.tagName: " + element.tagName);
			break;
		}
	}
}

function setSubmitButton(inputId, buttonId)
{
	var input = document.getElementById(inputId);
	var button = document.getElementById(buttonId);
	
	if (input && button)
	{
		input.addEventListener('keydown', function(e)
		{
			e = e || window.event;
			
			if (e.keyCode == 13)
			{
				if (e.preventDefault) 
				{
					e.preventDefault();
				}
				
				button.click();
			}
		}, true);
	}
}

window.addEventListener('DOMContentLoaded', 
function()
{
	var forms = document.getElementsByTagName("form");
	
	if (forms)
	{
		for (var i = 0; i < forms.length; i++)
		{
			forms[i].addEventListener('submit', function(e)
			{
				e = e || window.event;
				
				if (e && e.preventDefault)
				{
					if (document.body.getAttribute('aria-busy') == 'true') 
					{
						e.preventDefault();
					}
					else
					{
						document.body.setAttribute('aria-busy', 'true');
					}
				}
				
			}, true);
		}
	}	
});
