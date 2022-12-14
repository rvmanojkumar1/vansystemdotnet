$(document).ready(function() {
    $('#sdmForm').hide();
    $('#runNewSdm').click(function() {
		$('#sdmForm').slideToggle();
		//.toggleClass('outPort');
    });
    $('#downloadReport').hide();
    $('#loader').hide();
    
    $('.filters').click(function(){
		$('.filterSection').toggle('slow');
		text = $('#filterMap h4').text();
		$('#filterMap h4').text(text == "Hide filters" ? "Show filters" : "Hide filters");
    });

    $('#selectRange').hide();

    $(document).on('change','#selectReport',function(){
		$('#downloadReport').show();
		$('#downloadReportLink').attr('href',"/GisDashboard/downloadReport?name="+$("#selectReport").val());
    });

// -----------------------
// Check login on ajax
// -----------------------
// setInterval(function(){
//   $.ajax({
//     url : "/User/checkAccess",
//     success : function(response)
//     {
//       if(!response && sessionStorage.stopCheck)
//       {
//           window.location = "/Home/index";
//           sessionStorage.stopCheck = true;
//       }
//     }
//   });
// }, 3500);
});

function stopPropagation(evt) {
    if (evt.stopPropagation !== undefined) {
        evt.stopPropagation();
    } else {
        evt.cancelBubble = true;
    }
}

function GetQueryStringParams(sQuery, sParam) {
    var sURLVariables = sQuery.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
	}
	return 0;
}

function filterData(ele, load){
	var id = ele.val();
	var loadContainer = $("#showB"+load);
	var selected = loadContainer.data('selected');

	event.preventDefault();
	event.stopPropagation();

	if(typeof(id) != 'undefined') {
		$.ajax({
			type: "POST",
			url: "/Report/loadRegions",
			data: "id="+id+"&load="+load+"&selected="+selected,
			cache: false,
			success: function(html) {
				loadContainer.html(html);

				if(loadContainer.data('selected') != '') {
					var next = load+1;
					var eleNext = $('#hierarchy'+load);
					return filterData(eleNext, next);
				}
			}
		});
	}

	return;
}