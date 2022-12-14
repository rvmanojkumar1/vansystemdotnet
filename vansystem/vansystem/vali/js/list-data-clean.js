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

	$(document).on('click','#formDetails .edit-sample',function(){
		
		var id = $(this).data('id');
		var dataType = $('#formDetails').data('type');
		
		$.ajax({
			url : "/Report/editSample",
			type: "post",
			data : {
				"id": id,
				"type": dataType
			},
			success : function(response) {
				if(response != null) {
					$('#sampleModel .modal-body').html(response);
					$('#sampleModel .modal-body').css('overflow-y', 'visible');
					$('#sampleModel .modal-body').css('max-height', $(window).height() * 0.7);
					$('#sampleModel').modal({backdrop: 'static', keyboard : false});
					$('#sampleModel').modal('show');
					if(!$('#sampleModel .modal-footer').is(":visible")) {
						$('#sampleModel .modal-footer').show();	
					}

					if(typeof($('#range').val()) != 'undefined') {
						filterData($('#range'), 4, 'BBlock')
					}
				}
			}
		});

		return false;
	});
}

var table;
$(document).ready(function () {

	var dataTableHeight = $(window).height() - 340;

	var columns = $('.table-headers th');

	var formId = $('#formDetails').data('form'); //console.log(dataType);

	table = $('#formDetails').DataTable({
		"bProcessing": true,
		"bServerSide": true,
		"ajax": {
			"url": "/DataClean/loadData",
			"type": "POST",
			"data": {
				"form" : formId
			}
		},
		"aoColumnDefs": [
            { "bSearchable": false, "aTargets": [0, -1] }, 
            { "bSortable": false, "aTargets": [0, -1] }
        ],
		searchHighlight: true,
		"iDisplayLength": 25,
		"sEcho": 1,
		"scrollY": dataTableHeight,
		"scrollX": true,
		"pagingType": "full_numbers",
		lengthMenu: [[10, 25, 500, -1], [10, 25, 500, "All"]],
		fixedColumns:  {
			leftColumns: 3
		},
		dom: 'Blfrtip',
		buttons: [
			{
				text: '<i class="fa fa-plus fa-fw"></i> Add Sample</h2>',
				action: function() {
					
					$.ajax({
						url : "/Report/addSample",
						type: "post",
						data : {
							"type": dataType
						},
						success : function(response) {
							if(response != null) {
								$('#sampleModel .modal-body').html(response);
								$('#sampleModel .modal-body').css('overflow-y', 'visible');
								$('#sampleModel .modal-body').css('max-height', $(window).height() * 0.7);
								$('#sampleModel').modal({backdrop: 'static', keyboard : false});
								$('#sampleModel').modal('show');
								if(!$('#sampleModel .modal-footer').is(":visible")) {
									$('#sampleModel .modal-footer').show();	
								}
							}
						}
					});

				}
			},
		]
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
});

$(document).on('click','.saveSampleChanges',function(){

	//Fetch form to apply custom Bootstrap validation
	var form = $("#sampleForm");

	event.stopPropagation();

	if (form[0].checkValidity() === false) {
		event.preventDefault();
		event.stopPropagation();
	} else {
		var data = $('#sampleForm').serialize();
		
		$.ajax({
			data : data,
			type : "post",
			url : form.attr('action'),
			success : function(response) {
				//console.log(response);
				if(response.status === 'success') {
					$('#sampleModel .close').click();
					table.draw();
				} else {
					alert('Error occured.');
				}
			}
		});
	}
	form.addClass('was-validated');
});