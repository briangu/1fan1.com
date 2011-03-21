// Copyright 2010 OPS5 Limited.  All Rights reserved.

var init = true;
var curContext = '';
var myTimer = null;
var autoSelect = false;
var currentRequest = null;
var cache = null;
var gcache = null;
var inputArea = null;
var transArea = null;
var gallery = null;
var transProgress = null;
var segProgress = null;

function isAutoHLEnabled() {
    return $('highlightcb').checked;
}

function cancelRequest() {
    if (currentRequest != null) {
	currentRequest.cancel();
	currentRequest = null;

	segProgress.set('class','hidden');
	gallery.set('class','unhidden');
    }
}

function handleSelect(el){
	cancelRequest();

	if (document.selection) {
	    var range = document.selection.createRange();
	    var stored_range = range.duplicate();
	    stored_range.moveToElementText( el );
	    stored_range.setEndPoint( 'EndToEnd', range );

	    el.selectionStart = stored_range.text.length - range.text.length;
	    el.selectionEnd = el.selectionStart + range.text.length;
	}

	if (el.selectionStart == el.selectionEnd) {
	    if (el.selectionStart == el.value.length) {
		curContext = el.value;
		autoSelect = false;
	    }
	    else
	    {
		curContext = getNextToken(el).substring(0, 16);	
		autoSelect = true;
	    }
	} else {
		curContext = el.value.substring(el.selectionStart, el.selectionEnd);
		autoSelect = false;
	}

	if (myTimer != null) {
	    myTimer = $clear(myTimer);
	}
	myTimer = doLookup.delay(500);
}

function doLookup()
{
    myTimer = null;
    if (curContext.length > 0)
    {
	if (inputArea != null) {
	    inputArea.fireEvent('lookup');
	}
    }
}

function isPunctuation(c) 
{
	var punc = " `~!@#$%^&*()-_=+[{]}\\|;:'\",。？，<？.>/? \n"
	return (punc.indexOf(c) != -1)
}

function getNextToken(el) {
	var s = "";
	var p = el.selectionStart;
	var subLength = 1;

	while ((p + subLength) <= el.value.length) {
		var foo = el.value.charAt(p);
		if (isPunctuation(foo)) {
			break;
		}
		s += foo;
		p++;
	}

	return s;
}

window.addEvent('domready', function() {
	google.language.getBranding('branding');
	cache = new Cache(1024);
	gcache = new Cache(1024);

	inputArea = $('inputArea');
	transArea = $('transArea');
	gallery = $('gallery');
	transProgress = $('transProgress');
	segProgress = $('segProgress');

	var getMaxSegLength = function(results) {
	    if (results.length == 0) {
		return 0;
	    }
	    return results[0]["segment"]["simple"].length;
	}

	var createSegmentTable = function(results) {
		var table = new Element('table');

		if (results == null) {
		    alert('no data');
		    return table;
		}

		var j = 0;
		results.each(function(result) {
			var segment = result["segment"];

			if (j++ > 0)
			{
			    var row = new Element('tr').inject(table);
			    var col = new Element('td', {'valign': 'top', 'colspan' : 2, 'html':'<hr/>'}).inject(row);
			}
			
			var row = new Element('tr');
			var col = new Element('td', {'valign': 'top'}).inject(row);
			
			var ch = segment["simple"];
			var py = segment["pinyin"];
			var e = py.split(' ');
			var i = 0;
			e.each(function(item) {
				var charseg = new Element('div', {'class': 'charseg'}).inject(col);
				var hanzi = new Element('div', {'html': ch.charAt(i++), 'class': 'hanzi'}).inject(charseg);
				var pinyin = new Element('div', {'html': item, 'class': 'pinyin'}).inject(hanzi);
			    });

			var col2 = new Element('td', {'valign': 'top'}).inject(row);
			var t2 = new Element('table').inject(col2);
			var q = segment["trans"].split('/');
			i = 1;
			q.each(function(item) {
				var r2 = new Element('tr').inject(t2);
				var d2 = new Element('td').inject(r2);
				var trans = new Element('div', {'html': item, 'class': 'translation' + (i++ % 2)}).inject(d2);
			    });

			row.inject(table);
		});

		return table;
	};

	var transfn = function() {
	    var text = (inputArea.selectionStart == inputArea.selectionEnd) ? inputArea.value : curContext;

	    var trans = gcache.getItem(curContext);
	    if (trans != null) {
		transArea.innerHTML = trans;
		return;
	    }

	    transArea.set('class','hidden');
	    transProgress.set('class','unhidden');
	    google.language.detect(text, function(result) {
		    if (!result.error && result.language) {
			google.language.translate(text, result.language, "en",
						  function(result) {
						      if (result.translation) {
							  gcache.setItem(text, result.translation, {});
							  transArea.innerHTML = result.translation;
						      }
						      transProgress.set('class','hidden');
						      transArea.set('class','unhidden');
						  });
		    }
		});
	};

	var hsfn = function() {
	    handleSelect(inputArea);
	};

	var displayTable = function(jsonObj) {
	    var table = createSegmentTable(jsonObj);
	    gallery.set('html', '');
	    gallery.set('html', '<table>' + table.get('html') + '</table>');
//	    table.inject(gallery);

	    if (autoSelect) {
		if (isAutoHLEnabled()) {
		    var segLength = getMaxSegLength(jsonObj);
		    if (document.selection) {
			// TODO: make IE autoselect
		    } else {
			inputArea.selectionEnd = inputArea.selectionStart + segLength;
			curContext = inputArea.value.substring(inputArea.selectionStart, inputArea.selectionEnd);
		    }
		}
		transfn();
	    }
	};

	inputArea.addEvents({
		keyup: hsfn,
		mouseup: hsfn,
		click: hsfn,

		focus: function() {
		    if (init) {
			init = false;
			inputArea.value = '';
		    }
		},

		lookup: function() {
		    if (curContext == null) {
			return;
		    }

		    if (!autoSelect) {
			transfn();
		    }

/*
		    var jsonObj = cache.getItem(curContext);
		    if (jsonObj != null) {
			displayTable(jsonObj);
			return;
		    }
 */

		    cancelRequest();

		    gallery.set('class','hidden');
		    segProgress.set('class','unhidden');
		    currentRequest = new Request.JSON({
			    url: '/lup.json',
			    method: 'POST',
			    link: 'cancel',
//			    encoding: 'utf-8',
			    data: {'segment': curContext},
			    evalResult: true,
			    onComplete: function(jsonObj) {
				cache.setItem(curContext, jsonObj, {});
				displayTable(jsonObj);
				segProgress.set('class','hidden');
				gallery.set('class','unhidden');
				currentRequest = null;
			    }
			}).send();
		}
        });
});
