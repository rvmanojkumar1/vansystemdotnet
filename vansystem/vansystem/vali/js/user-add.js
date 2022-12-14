var hierarchy = '';
$(document).ready(function(){
	$('.email').on('keyup blur', function() {
		var t = $(this);
		var indx = t.val().search('@');
		var current = t.data('current');

		if(indx != -1 && current != t.val()) {
			$.ajax({
				url : "/User/checkUserEmail",
				type: 'get',
				data: {
					email: t.val()
				},
				dataType: 'json',
				success : function(response) {
					if(response.status == true) {
						$("#errorEmail").removeClass('hide').html(response.msg);
					} else {
						$("#errorEmail").addClass('hide').html('');
					}
				},
				error: function() {
					$("#errorEmail").show();
				}
			});
		} else {
			$("#errorEmail").addClass('hide').html('');
		}
	});

	$('.user').on('keyup blur', function() {
		var len = $(this).val().length;
		var current = $(this).data('current');

		if(len > 2 && current != $(this).val()) {
			$.ajax({
				url : "/User/checkUserId",
				type: 'get',
				data: {
					id: $(this).val()
				},
				dataType: 'json',
				success : function(response) {
					if(response.status == true) {
						$("#errorId").removeClass('hide').html(response.msg);
					} else {
						$("#errorId").addClass('hide').html('');
					}
				},
				error: function() {
					$("#errorId").removeClass('hide');
				}
			});
		} else {
			$("#errorId").addClass('hide').html('');
		}
	});

	$('#state').on('change', function() {
		var val = $(this).val();
		initState(val);
	});

	initRegion();

	initState($('#state').val());
});

function initState(state) {
	if(state != '') {
		var currentType = $('#region_type').data('type');
		$.ajax({
			url : "/User/loadStateHierarchy",
			type: 'post',
			data: {
				id: state
			},
			dataType: 'json',
			success : function(response) {
				if(response.status != 'false') {
					$('#region_type .type-option').remove();

					var h = 0;
					$.each(response.data, function(index, row) {
						$('#region_type').append('<option value="'+row.h_order+'"'+(row.h_order == currentType ? ' selected' : '')+' class="type-option">'+row.name+'</option>');

						if($('#hierarchy #region'+row.h_order).length == 0) {
							$('#hierarchy').append('<div class="col-md-3 region-box" id="region'+row.h_order+'"></div>');
						}

						if(h == 0) {
							$('#region_type').attr('data-load', row.h_order);
						}
						h++;
					});

					if(currentType != 0) {
						$('#region_type').trigger('change');
					}
				}
			},
			error: function() {
				$("#regionError").removeClass('hide');
			}
		});
	}
}

function loadCurrentAllocations() {
	var container = $('#region_data');
	var userId = $('#region_type').data('user');
	var state = $('#state').val();

	var resContainer = ($('#region_type').data('select') == 'multiple') ? '#selected_region' : '#region';

	$.ajax({
		url : "/User/loadUserAllocations",
		type: 'post',
		data: {
			user: userId,
			state: state
		},
		dataType: 'html',
		success : function(response) {
			container.find(resContainer+' .entries').html(response);
			selectRegion();
		},
		error: function() {
			$("#errorEmail").show();
		}
	});
}

function initRegion() {
	$('#region_type, .region_select').on('change', function(e) {
		e.stopImmediatePropagation();
		var container = $('#region_data');
		var regionType = $('#region_type').val();
		var loadData = $(this).data('load');
		var id = $(this).val();
		var userId = $('#region_type').data('user');
		var state = $('#state').val();

		var element = $(this).attr('id');

		var currentRegionType = $('#region_type').data('type');

		if(currentRegionType == regionType) {
			loadCurrentAllocations();
		}

		var requestData = {
			type: regionType,
			load: loadData,
			user: userId,
			state: state
		};

		if(element != 'region_type') {
			requestData.id = id;
		} else {
			$('#region .entries').html('');
			$('#selected_region .entries').html('');
			$('.region-box').html('');
		}

		if(regionType != '0') {
			container.removeClass('hide');
			container.find('#region .entries').html('');
			$.ajax({
				url : "/User/loadRegionEntries",
				type: 'post',
				data: requestData,
				dataType: 'html',
				success : function(response) {
					if(regionType == loadData) {
						container.find('#region .entries').html(response);
						selectRegion();
					} else {
						$('#region'+loadData).html(response);
						initRegion();
					}
				},
				error: function() {
					$("#errorEmail").show();
				}
			});

		} else {
			container.addClass('hide');
		}
	});
}

function selectRegion() {
	
	var regionType = $('#region_type').val();

	$('.entries .region').on('click', function(e) {
		e.stopImmediatePropagation();
		var ele = $(this);
		var res = ele.parents('.form-check');
		var container = $('#selected_region .entries');

		var type_id = ele.val();

		if (ele.prop('checked')) {
			var res_ele = res.clone();
			container.append(res_ele);

			var name = res_ele.find('#region_' + regionType + '_' + type_id).attr('name');
			container.find('.no-entry').hide();
			res_ele.find('#region_' + regionType + '_' + type_id).attr('id', 'select_region_' + regionType + '_' + type_id)
				.attr('name', 'select_' + name);
			res.addClass('selected');
			selectRegion();
		} else {
			$('#select_region_' + regionType + '_' + type_id).parents('.form-check').remove();
			$('#region_' + regionType + '_' + type_id).prop('checked',false);
		}
	});
}