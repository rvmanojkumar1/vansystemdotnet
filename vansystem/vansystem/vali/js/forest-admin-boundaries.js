$('form').each(function(){
	$(this).submit(function(e){
		//e.preventDefault();
		if(this[0].value == "" && this[1].value == ""){
			alert("Please select a file.");
			return  false;
		} else{
			console.log(this[0]);
			var file_id = $("#"+this.id+" .data-upload-file").attr('id');
			var param_id = $("#"+this.id+" .data-upload-param").attr('id');
			 $('#'+file_id).attr('name', 'zip_file');
			 $('#'+param_id).attr('name', 'h_id');
		}
	})
});

function deleteBoudnaries(name) {
	swal({
	  title: 'Are you sure?',
	  text: "It will delete all "+name+" boundaries as well as all child boundaries.\n\nYou won't be able to revert this once all boundaries are deleted!",
	  type: 'warning',
	  showCancelButton: true,
	  confirmButtonClass: "btn-danger",
  	  confirmButtonColor: '#dc3545',
  	  cancelButtonColor: '#3d963d',
	  confirmButtonText: 'Yes, delete it!'
	}, function(){
	    $.ajax({
	    	url: '/DataUpload/deleteBoundaries',
	    	type: 'post',
			data: {"name": name},
	    	success: function(status){
	    		var response = JSON.parse(status);
				if(response['responseType'] === '1'){
					swal({
					  title: 'Success',
					  text: "All boundaries have been deleted.",
					  type: 'success',
					  showCancelButton: false,
					  confirmButtonClass: "btn-success",
				  	  confirmButtonColor: '#dc3545',
					  confirmButtonText: 'Ok',
					  allowOutsideClick: false
					}, function(){
						 window.location = "/DataUpload/ForestAdminBoundaries";
					});
				} else{
					swal("","Error: Failed to delete boundaries of " + response['text'] + ". Contact site administrator","error");
					window.location = "/DataUpload/ForestAdminBoundaries";
				}
	    	},
	    	error: function(){
	    		swal("","Error: Failed to delete boundaries. Contact site administrator","error");
	    	}
	    });
	})
}