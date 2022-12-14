$(document).ready(function(){	
	$('INPUT[type="file"]').change(function () {
		var ext = $('#csv_file').val().split('.').pop().toLowerCase();
		if($.inArray(ext, ['csv']) == -1) {
			swal("","Invalid file format. Please upload csv file only.","error");
			$('#csv_file').val("");
			$("#submitButton").hide();
		} else{
			$("#submitButton").show();
		}
	});
});

function getChild(elemID, childIndex, childName){
	childVal = 2;
	parentVal = $("#"+elemID).val();
	$("#row_" + childVal).remove();
	//$("#csvUpload").hide();
	if($("#"+elemID).val() > 0){
		$.ajax({
			url: "/DataUpload/getChildList",
			type: "post",
			data: {'id': childVal, 'parentVal' : parentVal},
			success: function(response){
				var data = JSON.parse(response);
				if("error" in data){
					swal("Sorry!", "There is a problem processing your request. Please wait for some time or you can contact site administrator", "error");
					$("#bndTypeSuccess, #formContainer").hide();
					$("#bndTypeContainer").show();
				} else{
					renderChildDropdown(data, childVal, childName, childIndex);
				}
			},
			error: function(){
				swal("Sorry!", "There is a problem processing your request. Please wait for some time or you can contact site administrator", "error");
			}
		});
	}
}

function renderChildDropdown(data, value, name, childIndex){
	if($("#select_"+value).length){
		$("#row_"+value).nextAll('div').remove();
		$("#row_"+value).remove();
	}
	var html = '<div class="row" id="row_'+value+'">';
	html += '	<div class="col-md-1"><span class="badge-custom badge-primary">'+ childIndex +'</span></div>';
	html += '	<div class="col-md-11">';
	html += '		<div class="form-group">';
	html += '			<label for="exampleSelect1">Select '+name+'</label>';
	html += '			<select class="form-control" id="select_sop" name= "select_sop" onchange="showCSVUpload(this.id)">';
	html += '				<option value="0">Select</option>';
	for(i=0;i<data.length;i++){
		html += '					<option value="'+data[i]['id']+'">'+data[i]['name']+'</option>';
	}
	html += '			</select>';
	html += '		</div>';
	html += '	</div>';
	html += '</div>';
	$("#parentsWrapper").append(html);
}

function showCSVUpload(id){
	if($("#"+ id).val() > 0){
		$("#csvUpload").show();
	}
}

function deleteSpeciesData() {
	swal({
	  title: 'Are you sure?',
	  text: "It will delete all species data from the Van System.\n\nYou won't be able to revert this once all species data are deleted!",
	  type: 'warning',
	  showCancelButton: true,
	  confirmButtonClass: "btn-danger",
  	  confirmButtonColor: '#dc3545',
  	  cancelButtonColor: '#3d963d',
	  confirmButtonText: 'Yes, delete it!'
	}, function(){
	    $.ajax({
	    	url: '/DataUpload/deleteSpeciesData',
	    	type: 'post',
	    	success: function(status){
	    		var response = JSON.parse(status); //console.log(response['responseType']);
				if(response['responseType'] === '1') { //console.log("true");
					swal({
					  title: 'Success',
					  text: "All species data have been deleted.",
					  type: 'success',
					  showCancelButton: false,
					  confirmButtonClass: "btn-success",
				  	  confirmButtonColor: '#dc3545',
					  confirmButtonText: 'Ok',
					  allowOutsideClick: false
					}, function(){
						 window.location = "/DataUpload/speciesData";
					});
				} else{
					swal("","Error: Failed to delete species data. Contact site administrator","error");
					window.location = "/DataUpload/speciesData";
				}
	    	},
	    	error: function(){
	    		swal("","Error: Failed to delete species data. Contact site administrator","error");
	    	}
	    });
	})
}

function FileUpadate() {
	debugger;
	var info = new Object();
	var mid = "";
	
	var dfiles = $('#csv_file').get(0);
		if (dfiles.value != '') {
			var files = dfiles.files;
			var data = new FormData();
			for (var j = 0; j < files.length; j++) {

				var filename = files[j].name;
				data.append(files[j].name, files[j]);
			}

		}
		$.ajax({
			url: "FileUpload.ashx",
			type: "POST",
			data: data,
			contentType: false,
			processData: false,
			beforeSend: function () {


			},
			success: function (data, textStatus, xhr) {
				console.log(data);

				var v1 = data.split("#");
				if (v1[0] != 'Error') {
					console.log("file uploaded Successfully.");
				}
			},
		});
	
}
