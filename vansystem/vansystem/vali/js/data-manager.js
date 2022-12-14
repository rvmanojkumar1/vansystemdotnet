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
} );

function triggerUpdate() {
	$(document).on('click', '.discard', function(){
		elem = $(this);
		surveyId = $(this).attr('data-attr');
		assign = $(this).text();
		$.ajax({
			url : "/Data/discardData",
			type: "post",
			data : "surveyId="+surveyId+"&assign="+assign,
			success : function(response)
			{
				if(response == 1)
				{
					$('.discard[data-attr="'+surveyId+'"]').toggleClass('badge-danger badge-success');
					text = elem.text() == "Included" ? "Excluded" : "Included";
					$('.discard[data-attr="'+surveyId+'"]').text(text);

				}
			}
		});
	});

	$(document).on('dblclick', '#formDetails td',function() {
		if(typeof($(this).find('span').data('class')) == 'undefined') {
			return false;
		}

		var fieldData = $(this).find('span').data();
		$.ajax({
			url : "/DataManager/editField",
			type: "post",
			data : $.param(fieldData),
			success : function(response)
			{
				if(response != null)
				{
					$('#dataModal .modal-body').html(response);
					$('#dataModal .modal-body').css('overflow-y', 'visible');
					$('#dataModal .modal-body').css('max-height', $(window).height() * 0.7);
					$('#dataModal').modal({backdrop: 'static', keyboard : false});
					$('#dataModal').modal('show');
					if(!$('#dataModal .modal-footer').is(":visible"))
					{
						$('#dataModal .modal-footer').show();	
					}
					$('#editOption').chosen();
				}
			}
		});
	});

	$(document).on('click','a.more',function(){
		var sId = $(this).parents('tr').find('.survey-id').text();
			
		var values = $(this).parents('span').data('value');
		var label = $(this).parents('span').data('label');

		var valuesData = values.split("|");
		var newValues = valuesData.join("<br />");

		$('#dataModal .modal-body').html("<form class='form'><div>"+newValues+"</div></form>");
		$('#dataModal .modal-body').css('overflow-y', 'auto');
		$('#dataModal .modal-body').css('max-height', $(window).height() * 0.7);
		$('#dataModal .modal-title').html(label+" ( Survey ID: "+sId+" )");
		$('#dataModal').modal({backdrop: 'static', keyboard : false});
		$('#dataModal').modal('show');
		$('#dataModal .modal-footer').hide();		
	});
}

var table;
$(document).ready(function () {

	var dataTableHeight = screen.availHeight - 400;

	var columns = $('.table-headers th');

	var formId = $('#formDetails').data('form');
	var formName = $('#formDetails').data('name');
	
	var ajaxURL = '';
    if(typeof($('#formDetails').data('call')) != 'undefined') {
        ajaxURL = $('#formDetails').data('call');
    } else {
        console.error('ERROR! call URL is not provided.');
    }

	var data = {};
	if(typeof($('#formDetails').data('form')) != 'undefined') {
        data.form = $('#formDetails').data('form');
    }

	if(typeof($('#formDetails').data('group')) != 'undefined') {
        data.group = $('#formDetails').data('group');
    }

	if(typeof($('#formDetails').data('survey')) != 'undefined') {
        data.survey = $('#formDetails').data('survey');
    }

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
		"iDisplayLength": 25,
		"sEcho": 1,
		"scrollY": dataTableHeight,
		"scrollX": true,
		"pagingType": "full_numbers",
		"aoColumnDefs": [
            { "bSearchable": false, "aTargets": [0, 2] }, 
            { "bSortable": false, "aTargets": [0, 2] }
        ],
		lengthMenu: [[25, 50, 100], [25, 50, 100]],
		dom: 'lrtip',
		stateSave: true
	}).on("init.dt", function(e, settings, data) {
		triggerUpdate();
	});

	$('thead tr.filter-row th').each(function (index) {
		var title = $(this).text();
		if(title != '') {
			$(this).html('<input type="text" onclick="stopPropagation(event);" placeholder="Search ' + title + '" id="'+index+'" />');
		}
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

	$(document).on('click', '.saveFieldChanges',function(){

		//Fetch form to apply custom Bootstrap validation
		var form = $("#saveEditOption");
	
		if (form[0].checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			var data = $('#saveEditOption').serialize();
			var id = GetQueryStringParams(data, 'id');
			
			$.ajax({
				data : data,
				type : "post",
				url : "/DataManager/updateFieldData",
				success : function(response) {
					if(response.status == 'success') {

						var className = typeof(response.class) != 'undefined' ? response.class : 'fdid-'+id;

						$("."+className).html(response.value);
						$('#dataModal .close').click();
						table.draw();
					} else {
						alert('Error occured.');
					}
				}
			});
		}
		form.addClass('was-validated');
	});
});