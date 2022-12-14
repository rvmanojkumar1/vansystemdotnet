var table;
$(document).ready(function () {

	$('thead tr.filter-row th').each(function (index) {
		var title = $(this).text();
		if(title != '') {
			$(this).html('<input type="text" onclick="stopPropagation(event);" placeholder="Search ' + title + '" id="'+index+'" />');
		}
	});

	$.fn.dataTable.pipeline = function ( opts ) {
		// Configuration options
		var conf = $.extend( {
			pages: 5,     // number of pages to cache
			url: '',      // script url
			data: null,   // function or object with parameters to send to the server
						// matching how `ajax.data` works in DataTables
			method: 'POST' // Ajax HTTP method
		}, opts );
	
		// Private variables for storing the cache
		var cacheLower = -1;
		var cacheUpper = null;
		var cacheLastRequest = null;
		var cacheLastJson = null;
	
		return function ( request, drawCallback, settings ) {
			var ajax          = false;
			var requestStart  = request.start;
			var drawStart     = request.start;
			var requestLength = request.length;
			var requestEnd    = requestStart + requestLength;
	
			if ( settings.clearCache ) {
				// API requested that the cache be cleared
				ajax = true;
				settings.clearCache = false;
			}
			else if ( cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper ) {
				// outside cached data - need to make a request
				ajax = true;
			}
			else if ( JSON.stringify( request.order )   !== JSON.stringify( cacheLastRequest.order ) ||
				JSON.stringify( request.columns ) !== JSON.stringify( cacheLastRequest.columns ) ||
				JSON.stringify( request.search )  !== JSON.stringify( cacheLastRequest.search )
			) {
				// properties changed (ordering, columns, searching)
				ajax = true;
			}
	
			// Store the request for checking next time around
			cacheLastRequest = $.extend( true, {}, request );
	
			if ( ajax ) {
				// Need data from the server
				if ( requestStart < cacheLower ) {
					requestStart = requestStart - (requestLength*(conf.pages-1));
	
					if ( requestStart < 0 ) {
						requestStart = 0;
					}
				}
	
				cacheLower = requestStart;
				cacheUpper = requestStart + (requestLength * conf.pages);
	
				request.start = requestStart;
				request.length = requestLength*conf.pages;
	
				// Provide the same `data` options as DataTables.
				if ( $.isFunction ( conf.data ) ) {
					// As a function it is executed with the data object as an arg
					// for manipulation. If an object is returned, it is used as the
					// data object to submit
					var d = conf.data( request );
					if ( d ) {
						$.extend( request, d );
					}
				}
				else if ( $.isPlainObject( conf.data ) ) {
					// As an object, the data given extends the default
					$.extend( request, conf.data );
				}
	
				settings.jqXHR = $.ajax( {
					"type":     conf.method,
					"url":      conf.url,
					"data":     request,
					"dataType": "json",
					"cache":    false,
					"success":  function ( json ) {
						cacheLastJson = $.extend(true, {}, json);
	
						if ( cacheLower != drawStart ) {
							json.data.splice( 0, drawStart-cacheLower );
						}
						json.data.splice( requestLength, json.data.length );
	
						drawCallback( json );
					}
				} );
			}
			else {
				json = $.extend( true, {}, cacheLastJson );
				json.draw = request.draw; // Update the echo for each response
				json.data.splice( 0, requestStart-cacheLower );
				json.data.splice( requestLength, json.data.length );
	
				drawCallback(json);
			}
		}
	};
	
	// Register an API method that will empty the pipelined data, forcing an Ajax
	// fetch on the next draw (i.e. `table.clearPipeline().draw()`)
	$.fn.dataTable.Api.register( 'clearPipeline()', function () {
		return this.iterator( 'table', function ( settings ) {
			settings.clearCache = true;
		} );
	});

	var dataTableHeight = $(window).height() - (typeof($('#dtConfig').data('height')) != 'undefined' ? $('#dtConfig').data('height') : 230);

	var columns = $('.table-headers th');

	var formId = $('#dtConfig').data('form');
	var formName = $('#dtConfig').data('name');
	
	var ajaxURL = '';
    if(typeof($('#dtConfig').data('call')) != 'undefined') {
        ajaxURL = $('#dtConfig').data('call');
    } else {
        console.error('ERROR! call URL is not provided.');
    }

	var data = {};
	if(typeof($('#dtConfig').data('form')) != 'undefined') {
        data.form = $('#dtConfig').data('form');
    }

	if(typeof($('#dtConfig').data('group')) != 'undefined') {
        data.group = $('#dtConfig').data('group');
    }

	if(typeof($('#dtConfig').data('survey')) != 'undefined') {
        data.survey = $('#dtConfig').data('survey');
    }

	if(typeof($('#dtConfig').data('value')) != 'undefined') {
        data.value = $('#dtConfig').data('value');
    }

	var columnDefinitions = [
		{ "bSearchable": false, "aTargets": [0, 2] }, 
		{ "bSortable": false, "aTargets": [0, 2] }
	];

	if(typeof($('#dtConfig').data('numeric')) != 'undefined') {
        columnDefinitions.push({
			targets: $('#dtConfig').data('numeric'),
			className: 'text-right'
		});
    }

	var leftFixed = typeof($('#dtConfig').data('fixed-left')) ? $('#dtConfig').data('fixed-left') : 3;
	var dataLength = typeof($('#dtConfig').data('length')) ? $('#dtConfig').data('length') : 25;
	var tableDom = typeof($('#dtConfig').data('dom')) ? $('#dtConfig').data('dom') : 'lBrtip';

	var tableBtns = [];

	if(typeof($('#dtConfig .buttons').html()) != 'undefined') {
		$('#dtConfig .buttons .button').each(function() {
			var btnConfig = $(this).data();
			if(typeof(btnConfig.class) != 'undefined')  btnConfig.className = btnConfig.class;
			tableBtns.push($(this).data());
		})
	}

	$('#formDetails').on('init.dt', function() {

		$('#dtConfig .buttons .modal-data').each(function() {
			var btnConfig = $(this).data();
			var elementClass = btnConfig.id; console.log($(elementClass));
			if(typeof(btnConfig.url) != 'undefined')  $(elementClass).attr('data-url', btnConfig.url);
			if(typeof(btnConfig.query) != 'undefined')  $(elementClass).attr('data-query', btnConfig.query);
			if(typeof(btnConfig.title) != 'undefined')  $(elementClass).attr('data-title', btnConfig.title);
		}); 
	 });

	table = $('#formDetails').DataTable({
		"bProcessing": true,
		"bServerSide": true,
		"ajax": {
			"url": ajaxURL,
			"type": "POST",
			"data": data
		},
		oLanguage: {sProcessing: '<div id="loader"><div class="sk-folding-cube"><div class="sk-cube1 sk-cube"></div><div class="sk-cube2 sk-cube"></div><div class="sk-cube4 sk-cube"></div><div class="sk-cube3 sk-cube"></div>VAN</div></div>'},
		searchHighlight: true,
		"iDisplayLength": dataLength,
		"sEcho": 1,
		"scrollY": dataTableHeight,
		"scrollX": true,
		"aoColumnDefs": columnDefinitions,
		dom: tableDom,
		stateSave: true,
		buttons: tableBtns
	}).on("init.dt", function(e, settings, data) {
		// triggerUpdate();
	});
	
	// Apply the filter
	$(".filter-row input").keypress( function () {
		if (event.which == 13) {
			event.preventDefault();
			table
				.columns(parseInt($(this).attr('id')))
				.search($(this).val())
				.draw();
		}
	});

	$(document).on('click', 'button.view-modal',function() {

		var eleData = $(this).data();
		
		$.ajax({
			url : eleData.url,
			data : eleData.query,
			success : function(response)
			{
				if(response != null)
				{
					$('#dataModal .modal-body').html(response);
					$('#dataModal .modal-body').css('overflow-y', 'visible');
					$('#dataModal .modal-body').css('max-height', $(window).height() * 0.7);
					$('#dataModal').modal({backdrop: 'static', keyboard : false});
					$('#dataModal').modal('show');
					$('#dataModal .modal-header h5.modal-title').html(eleData.title);	
					if(!$('#dataModal .modal-footer').is(":visible"))
					{
						$('#dataModal .modal-footer').hide();	
					}
					$('#editOption').chosen();
				}
			}
		});
	});
});