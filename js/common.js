// $Id: common.js,v 1.7 2013/04/24 05:57:50 cvs Exp $
// JavaScript tool and utilities
// Copyright (c) 2005-2006 Dmitriy Rogatkin
// All rights reserved.


function submitFormOnEnter (field, evt) {
   var keyCode = evt.which ? evt.which : evt.keyCode;
   if (keyCode == 13) {
      field.form.submit();
      return false;
   } else 
      return true;
}

function getOffsetLeft (el) {
  var ol = el.offsetLeft;
  while ((el = el.offsetParent) != null)
    ol += el.offsetLeft;
  return ol;
}

function getOffsetTop (el) {
  var ot = el.offsetTop;
  while((el = el.offsetParent) != null)
   ot += el.offsetTop;
  return ot;
}

function getElement(id) {
	// TODO cache in hash
  if (document.all)
      return document.all(id);
  return document.getElementById(id);           
}

function makeArrText(up) {
  return up?'&#9660':'&#9650;';
}

function getFormField(el_name, form_name) {
	if (form_name) 
		return document.forms[form_name].elements[el_name];
	else {
		if (formName) 
			return document.forms[formName].elements[el_name];
		return document.forms[0].elements[el_name];
	}
}

function centerElement(el)  {
	  var left=0, top=0;
	  if( self.pageYOffset ) {
	    left = self.pageXOffset;
	     top = self.pageYOffset;
	  } else if( document.documentElement && document.documentElement.scrollTop ) {
	    left = document.documentElement.scrollLeft;
	    top = document.documentElement.scrollTop;
	  } else if( document.body ) {
	     left = document.body.scrollLeft;
	     top = document.body.scrollTop;
	  } 
	  
	  el.style.left = Math.max((left + (getWindowWidth() - el.offsetWidth) / 2), 0) + 'px';
	  el.style.top = Math.max((top + (getWindowHeight() - el.offsetHeight) / 2), 0) + 'px';
	  //el.style.position='fixed';
 }

function getWindowWidth() {
	var width =
		document.documentElement && document.documentElement.clientWidth ||
		document.body && document.body.clientWidth ||
		document.body && document.body.parentNode && document.body.parentNode.clientWidth ||
		0;

	return width;
}
 
function getWindowHeight() {
    var height =
		document.documentElement && document.documentElement.clientHeight ||
		document.body && document.body.clientHeight ||
  		document.body && document.body.parentNode && document.body.parentNode.clientHeight ||
  		0;
  		
  	return height;
}

function message(key) {
	// TODO use key in lookup localized message association
	if (localized_messages) {
		var mess = localized_messages[key];
		if (mess) {
			getElement('status').innerHTML = mess;
			return;
		}			
	}
	getElement('status').innerHTML = key;
}

var ajax = {
   noaccesscode:403,

   noaccessredirect:'/',

   put: function(req) {
	   var self = this
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', req.url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
    	  self.processResponse(xhr,req) 
      }
      xhr.send(JSON.stringify(req.payload));
   },

   get: function(req) {
	   var self = this
	   var xhr = new XMLHttpRequest();
	      xhr.open('GET', req.url);
	      xhr.onload = function () {
	    	  self.processResponse(xhr,req) 
	      }
	      xhr.send();
   },
   
   dele: function(req) {
	   // TODO think of reusing put
	   var self = this
	      var xhr = new XMLHttpRequest();
	      xhr.open('DELETE', req.url);
	      xhr.setRequestHeader('Content-Type', 'application/json');
	      xhr.onload = function () {
	    	  self.processResponse(xhr,req) 
	      }
	      xhr.send(JSON.stringify(req.payload));
   }, 
   
   processResponse: function (xhr,req) {
       if (xhr.status === 200) {
    	   if (req.respType && req.respType == 'html')
    		   req.success(xhr.responseText)
    	   else	
           try {
        	   req.success(JSON.parse(xhr.responseText));
           } catch(e) {
              if (typeof req.fail === 'function')
                  req.fail( xhr.status, e )
           }
        } else if (this.noaccesscode === xhr.status &&  this.noaccessredirect) {
           window.location = this.noaccessredirect
        } else if (typeof req.fail === 'function')
           req.fail( xhr.status )
   }
}