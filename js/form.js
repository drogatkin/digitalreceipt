/**
 * WebBee ajax handlers
 * 
 * Copyright 2011 Dmitriy Rogatkin
 */
var formName;
var baseServURI;
var activeAutosuggestSelect;
var frameLoaded = 0;
var sequence_holder = 1;
var IE9x64Bug = navigator.appName == 'Microsoft Internet Explorer';
// alert(navigator.appName+" "+IE9x64Bug);
function addCascadeHandler(attachto, attachfor) {
	if (!document.forms[formName])
		return;
	var field = document.forms[formName][attachto];
	// alert("Attaching to :"+field);
	if (field) {
		var oldChange = field.onchange;
		field.onchange = function() {
			// alert(attachfor);
			var action = document.forms[formName].action;
			if (!action)
				action = baseServURI + formName;
			makeGenericAjaxCall(action + "/ajax/Cascading?cascaded="
					+ attachfor, grabvalues(collecMap[attachfor]), true,
					function(resp) {
						if (resp == '')
							return;
						var model = new Function("return " + resp)()
						var data = model.data;
						var af = document.forms[formName][attachfor];
						if (af.type == 'select-one') {
							af.options.length = 0;
							for ( var i = 0; i < data.length; i++)
								try {
									af.options[i] = new Option(
											data[i][model.mapping[1]],
											data[i][model.mapping[0]]);
								} catch (e) {
								}
							// af.onchange(); // TODO add check for cycles
						}
					});
			// prototype.onchange.call()
		};
		field.onchange.prototype.updated = attachfor;
		field.onchange.prototype.onchange = oldChange;
	}
}
function getOffsetLeft1(el, type) {
	var ol = el.offsetLeft;
	while ((el = el.offsetParent) != null) {
		if (el.nodeName != type)
			ol += el.offsetLeft;
		// alert('no:'+ol+', add:'+el.offsetLeft+',el:'+el.nodeName);
	}
	return ol;
}

function addAutosuggestHandler(attachto) {
	if (!document.forms[formName])
		return;
	var field = document.forms[formName][attachto];
	var action = document.forms[formName].action;
	if (!action)
		action = baseServURI + formName;
	// alert("Attaching to :"+field);
	if (field && field.type == 'text') {

		field.onkeyup = function(e) {
			makeJSONAjaxCall(
					action + '/ajax/Autosuggest?autosuggest=' + attachto
							+ '&formname=' + formName,
					grabvalues(collecMap[attachto], attachto),
					true,
					function(model) {
						var af = document.forms[formName][attachto];

						if (af.type == 'text') { // do auto-suggest for text
							// only
							var tf = af; //alert('tf set');
							var data = model;
							if (model.data) { // new format, target field
								// provided
								if (model.target) {
									if (model.target.length
											&& model.target.length > 0
											&& model.target[0] != null) {
										tf = document.forms[formName][model.target[0]];
									} else
										tf = document.forms[formName][model.target];
								}
								data = model.data;
							}
							var x = getOffsetLeft1(af, ''); // 'LABEL'
							var y = getOffsetTop(af) + af.offsetHeight;
							if (typeof (activeAutosuggestSelect) == 'undefined') {
								activeAutosuggestSelect = document
										.createElement("select");
								activeAutosuggestSelect.style.position = 'absolute';
								activeAutosuggestSelect.style.zIndex = 99;
								document.body
										.appendChild(activeAutosuggestSelect);
								// af.parentNode.insertBefore(activeAutosuggestSelect,
								// af);
							} else {
								try {
									activeAutosuggestSelect.style.visibility = 'block';
								} catch (e) {
									// alert (typeof (activeAutosuggestSelect)+'
									// '+e);
									// activeAutosuggestSelect = null;
								}
							}
							activeAutosuggestSelect.options.length = 0;
							activeAutosuggestSelect.style.left = x + 'px';
							activeAutosuggestSelect.style.top = y + 'px';
							activeAutosuggestSelect.style.width = af.offsetWidth
									+ 'px';
							if (data.length > 0) {
								activeAutosuggestSelect.size = Math.min(10,
										data.length);
								for ( var o in data) {
									activeAutosuggestSelect.options[o] = new Option(
											data[o][model.mapping[1]],
											data[o][model.mapping[0]]);
								}
								activeAutosuggestSelect.onkeyup = function(e) {
									var keyCode;
                                                                        if (event)
                                                                           keyCode = event.keyCode;

									switch (keyCode) {
									case 13:
										if (activeAutosuggestSelect
												&& activeAutosuggestSelect.selectedIndex >= 0) {
											if (tf)
												tf.value = activeAutosuggestSelect.options[activeAutosuggestSelect.selectedIndex].value;
											if (tf != af)
												af.value = activeAutosuggestSelect.options[activeAutosuggestSelect.selectedIndex].text;
											// update values of all target
											// fields
											if (model.target.length
													&& model.target.length > 1) {
												for ( var t = 1; t < model.target.length; t++) {
													var te = document.forms[formName][model.target[t]];
													if (te)
														// TODO switch by type
														// of element
														te.value = data[activeAutosuggestSelect.selectedIndex][model.mapping[t] ? model.mapping[t]
																: model.target[t]];
												}
											}
											if (IE9x64Bug)
												activeAutosuggestSelect.style.width = 0;
											else
												activeAutosuggestSelect.style.visibility = 'hidden';
											af.focus();
										}
										event.returnValue = false;
										event.cancelBubble = true;
										break;
									case 27: // escape
										// if (activeAutosuggestSelect)
										if (IE9x64Bug)
											activeAutosuggestSelect.style.width = 0;
										else
											activeAutosuggestSelect.style.visibility = 'hidden';
										// af.focus();
									}
								};
								activeAutosuggestSelect.onclick = function(e) {
									if (activeAutosuggestSelect
											&& activeAutosuggestSelect.selectedIndex >= 0) {
                                                                                if (!tf)
                                                                                   tf = af;
										tf.value = activeAutosuggestSelect.options[activeAutosuggestSelect.selectedIndex].value;
										if (tf != af)
											af.value = activeAutosuggestSelect.options[activeAutosuggestSelect.selectedIndex].text;
										// updateValues();
										if (model.target.length
												&& model.target.length > 1) {
											for ( var t = 1; t < model.target.length; t++) {
												var te = document.forms[formName][model.target[t]];
												if (te)
													// TODO switch by type of
													// element
													te.value = data[activeAutosuggestSelect.selectedIndex][model.mapping[t] ? model.mapping[t]
															: model.target[t]];
											}
										}
										// //////////
										if (IE9x64Bug)
											activeAutosuggestSelect.style.width = 0;
										else
											activeAutosuggestSelect.style.visibility = 'hidden';
										af.focus();
									}
								};
							} else
								activeAutosuggestSelect.size = 2;
						} // no autosuggest for noon text fields
//else alert('no tf');
					});
		};

		field.onkeydown = function(e) {
			var keyCode;

                        if (window.event)
                           keycode = window.event.keyCode;
                        else if (e)
                           keycode = e.which;

			switch (keyCode) {
			// Return/Enter
			case 13:
				if (typeof (activeAutosuggestSelect) != 'undefined')
					if (IE9x64Bug)
						activeAutosuggestSelect.style.width = 0;
					else
						activeAutosuggestSelect.style.visibility = 'hidden';
				event.returnValue = false;
				event.cancelBubble = true;
				break;

			// Escape
			case 27:
				if (typeof (activeAutosuggestSelect) != 'undefined')
					if (IE9x64Bug)
						activeAutosuggestSelect.style.width = 0;
					else
						activeAutosuggestSelect.style.visibility = 'hidden';
				event.returnValue = false;
				event.cancelBubble = true;
				break;
			// Down arrow
			case 40:
				if (activeAutosuggestSelect) {
					// if (activeAutosuggestSelect.style.visibility == 'hidden')
					// activeAutosuggestSelect.style.visibility = '';
					if (activeAutosuggestSelect.style.visibility != 'hidden'
							&& activeAutosuggestSelect.style.width != 0) {
						activeAutosuggestSelect.focus();
						activeAutosuggestSelect.selectedIndex = 0;
					}

				}
				return false;
				break;
			}
		};
	}
}

function initCommonAutosuggestHandlers() {
	var hideDropdown = function() {
		if (typeof(activeAutosuggestSelect) != 'undefined')
			activeAutosuggestSelect.style.visibility = 'hidden';
	};
	if (document.addEventListener) {
		document.addEventListener('click', hideDropdown, false);
	} else if (document.attachEvent) {
		document.attachEvent('onclick', hideDropdown, false);
	}
}

function grabvalues(fields, extra) {
	// alert(fields);
	var parameters = 'undefined';
	for ( var i in fields) {
		var fn = fields[i];
		parameters = addParam(parameters, fn);
	}
	if (extra != null)
		parameters = addParam(parameters, extra);
	return parameters;
}

function addParam(currentParams, fn) {
	var f1 = document.forms[formName][fn];
	var v;
	if (f1.type == 'select-one') {
		if (f1.selectedIndex >= 0)
			v = f1.options[f1.selectedIndex].value;
		else
			v = '';
	} else if (f1.type == 'select-multiple') {

	} else if (f1.type == 'password') {
		v = f1.value;
	} else if (f1.type == 'text') {
		v = f1.value;
	} else if (f1.type == 'radio') {
	} else if (f1.type == 'checkbox') {
	} else if (f1.type == 'file') {
	} else if (f1.type == 'hidden') {
		v = f1.value;
	}
	if (currentParams == 'undefined')
		currentParams = fn + '=' + encodeURIComponent(v);
	else
		currentParams += '&' + fn + '=' + encodeURIComponent(v);
	return currentParams;
}

function addAttchHandler(fn, serv) {
	var attach = getElement('$$' + fn);
	if (attach)
		attach.onclick = function() {
			uploadFile(fn, serv);
		}
}

function uploadFile(fn, serv) {
	sequence_holder++;
	var target = 'N' + sequence_holder;
	var divid = '---' + target;
	var fdiv = getElement(divid);
	// alert("upload?"+target+" "+fdiv);
	if (fdiv == null) {
		if (!serv)
			serv = 'Attach';
		fdiv = document.createElement("div");
		fdiv.innerHTML = '<iframe src="' + serv + '?divid=' + divid + '&name='
				+ encodeURIComponent(fn) + '&target='
				+ encodeURIComponent(target) + '" name="' + target + '" id="'
				+ target + '"></iframe>';
		fdiv.id = divid;
		fdiv.style.display = 'none'; //alert( fdiv.innerHTML);
		document.body.appendChild(fdiv);
	} //alert(           'checkLoaded(\'' + target + '\',\'' + fn + '\')');
	setTimeout ('checkLoaded(\'' + target + '\',\'' + fn + '\')', 500);
}

function updateUploadStatus(target, fn, mess) {
	frameLoaded = 1;
}

function attachAndUpload(target, fn) {
	// TODO forms[0] -> name of form
	if (frames[target])
		frames[target].document.forms[0].browsefile.click();
	else
		alert('no frame' + target);       
}

function uploadProgress(fn, per) {
   getElement('!!%' + fn).innerHTML = per;
}

function uploadInitiated(path, fn, len) {
	getElement('!!' + fn).innerHTML = 'Uploading /fakepath/' + path + ' ... '+(len?len:'');

}

function uploadDone(fn, file, id, divid, serv) {
	uploadProgress(fn, '&nbsp;');
	document.forms[formName][fn].value = id;
	if (!serv)
		serv = 'Attach';
	getElement('!!' + fn).innerHTML = '<a href="' + serv + '?id=' + id + '">'
			+ file + '</a>';
	document.body.removeChild(getElement(divid));
	postUploadProcess(fn, file, id);
}

function checkLoaded(target, fn) {
	if (frameLoaded == 1) {
//alert("t:"+target);
		//clearInterval();
		frameLoaded = 0;
		attachAndUpload(target, fn);
	} else
          setTimeout  ('checkLoaded(\'' + target + '\',\'' + fn + '\')', 500);
}

function postUploadProcess(fn, file, id) {

}

// /////////////////// editable tabular related //////////////////////////
function editRow(rid, freeparam) {
	// alert("==>"+rid+getURIHeaderId(freeparam));
	makeJSONAjaxCall(
			serviceName + '/ajax/editRow?rowId=' + rid
					+ getURIHeaderId(freeparam),
			formValues2String(document.forms.editable),
			true,
			function(result) {
				for ( var f in result) {
					if (document.forms.editable.elements[f]) {
						if (document.forms.editable.elements[f].type == 'select-one') {
							document.forms.editable.elements[f].selectedIndex = 0;
							for ( var i = 0; i < document.forms.editable.elements[f].options.length; i++)
								if (document.forms.editable.elements[f].options[i].value == result[f]) {
									document.forms.editable.elements[f].selectedIndex = i;
									break;
								}
						} else if (document.forms.editable.elements[f].type == 'radio'
								|| document.forms.editable.elements[f].type == 'checkbox') {
							document.forms.editable.elements[f].selected = result[f] == document.forms.editable.elements[f].value;
						} else
							document.forms.editable.elements[f].value = result[f];
					}
				}
				getElement('edit_form_holder').style.display = '';
			});
}

function updateRow(rid) {
	if (!rid)
		rid = document.forms.editable.id.value;
	makeJSONAjaxCall(serviceName + '/ajax/updateRow?rowId=' + rid
			+ getURIHeaderId(), formValues2String(document.forms.editable),
			true, function(result) {
				if (result && result.id && result.id != '-1') {
					// TODO here is problem either consider row data get from
					// current form data, or loaded from server
					// loading can be beneficial since allow reuse call for
					// concurrent editing
					document.forms.editable.id.value = result.id;
					// alert("id back "+result.id);
					insertTabular(result);
					getElement('edit_form_holder').style.display = 'none';
				}
			});
}

function removeRow(rid) {
	makeGenericAjaxCall(serviceName + '/ajax/deleteRow?rowId=' + rid
			+ getURIHeaderId(), formValues2String(document.forms.editable),
			true, function(result) {
				// refresh tabular since all ids can be changed
				deleteTabular(rid);
			});
}
