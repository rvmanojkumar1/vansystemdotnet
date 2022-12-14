var setData = null;
function triggerUpdate()
{
	$('.discard').each(function(){
		$(this).unbind('click');
		$(this).on('click',function(){
			elem = $(this);
			surveyId = $(this).attr('data-attr');
			assign = $(this).text();
			$.ajax({
				url : "/DataEdit/discardData",
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
	});
}

$(document).ready(function () {
	$('.regionSelect').hide();
	$('#getData').hide();
	$('.downAll').hide();
	$(document).on('change','.regionSelect select',function(event){
		id = $('option:selected', this).attr('data-id');
		if($(this).parent().next().length)
		{
			elem = $(this).parent().next();
			$(elem).find('select option').each(function(){
				if($(this).attr('data-parent-id') == id || $(this).attr('data-parent-id') == "-1")
				{
					$(this).show();
				}else{
					$(this).hide();
				}
			});
			elem.show();
			elem.find('select').val(elem.find("option:first").val());
			if($(this).val() != "Select")
			{
				if(elem.find('select option:visible').length == 1)
				{
					swal("Empty Warning!", "The "+elem.find('span').text()+" list is empty.", "warning");
				}
			}
		}
	});

	$('#getData').on('click',function(){
		var ids = [];
		flag = 0;
		$('.regionSelect').each(function(){
			id = $(this).find("select option:selected").attr('data-id');
			key = $(this).find("select").attr('id');
			flag = flag+parseInt(id);
			ids.push(id+":"+key);
		});
		
		if(flag == -3)
		{
			alert("Please select a region!");
			return false;
		}
		
		formId =  $("#formSelect select").val();
		if(formId == "Select")
		{
			alert("Please select a form!");
			return false;
		}
		
		$('#loader').show();
		$.ajax({
			url : "/DataEdit/getData",
			type : "post",
			data : "formId="+formId+"&ids="+ids,
			success : function(response)
			{
				// if(response == null)
				// {
				// 	 location.reload();
				// }
				var json_obj = $.parseJSON(response);
				if(json_obj.null == false)
				{
					if(setData != null)
					{
						setData.destroy();
						setData = null;
						$('#plots').html('<table class="table table-dark cell-border" id="plotDetails"></table>');
					}
					$('#tabs').html(json_obj.tabs);
					$('#plots table').html(json_obj.html);
					setData = $('#plotDetails').DataTable({
						dom: 'Blfrtip',
				        buttons: [
				            {
								extend: 'excel',
								text: 'Download excel',
								filename: "Ifmt-data",
							}
				        ],
						lengthMenu: [[5,10, 25, 50, -1], [5,10, 25, 50, "All"]],
						pageLength: 5,
						scrollX: true,
						scrollCollapse: true,
						fixedColumns:  {
				            leftColumns: 3
				        }
					});
					triggerUpdate();
					$('tbody td').each(function() { if($(this).attr('data-attr') == ""){$(this).css('color','grey');} });
				}else{
					if(setData != null)
					{
						setData.destroy();
						setData = null;
						$('#plots').html('<table class="table table-dark cell-border" id="plotDetails"></table>');
					}
					$('#plots table').html(json_obj.html);
				}
				$("#catId").chosen({
					placeholder_text_multiple: "Select Categories..."
				}).change(function() {
					if($(this).val() == 'all')
					{
						setData.columns().visible(true);	
					}else{
						setData.columns().visible(false);
						setData.columns([0,1]).visible(true);
						$.each($(this).val(), function(i,v){
							v = v.replace(/ /g, '-');
							v = v.toLowerCase();
							setData.columns('.'+v).visible(true);
						});
					}
				});
				$('#loader').hide();
			}
		});
	});
	$(document).on('change','[name="plotDetails_length"]',function(){
		$('tbody td').each(function() { if($(this).attr('data-attr') == ""){$(this).css('color','grey');} });
	});

	$(document).on('click','.paginate_button',function(){
		$('tbody td').each(function() { if($(this).attr('data-attr') == ""){$(this).css('color','grey');} });
	});

	$(document).on('change','#plotDetails_length',function(){
		triggerUpdate();
	});

	$(document).on('click','.paginate_button',function(){
		triggerUpdate();
	});

	$(document).on('click','.tabOpen',function(){
		$('#dataModal .table').html($(this).parent().find('.popupTab').html());
		$('#dataModal').modal('show');
	});

	$('#formSelect select').on('change',function(){
		if($(this).val() == "Select")
		{
			$('.regionSelect').slideUp('slow',function(){
				$('#getData').hide();	
			});
		}else{
			$('.regionSelect').slideDown('slow', function(){
				$('#getData').show();
			});
		}
		
		if($(this).val() == "6" || $(this).val() == "4" || $(this).val() == "5")
		{
			$('#plot-mast').hide();
		}else{
			$('#plot-mast').show();
		}

		if($(this).val() == "6" || $(this).val() == "4")
		{
			$('#compartment-mast').hide();
		}else{
			$('#compartment-mast').show();
		}
	});

	$(document).on('dblclick','#plots table td',function(){
		if(!$(this).hasClass('disbale-dbl'))
		{
			val = $(this).attr('data-attr');
			sId = $(this).parent().find('.sId').text();
			fId = $(this).parent().find('.sId').attr('data-fId');
			seqId = $(this).attr('data-seq_id');
			gId = $(this).attr('data-g_id');
			pId = $(this).attr('data-p_id');
			if(val == "")
			{
				$.jGrowl("Fields can't be edited");
			}else{
				$.ajax({
					url : "/DataEdit/editOptions",
					type: "post",
					data : "attr="+val+"&sId="+sId+"&fId="+fId+"&seqId="+seqId+"&gId="+gId+"&pId="+pId,
					success : function(response)
					{
						if(response != null)
						{
							$('#dataModal .modal-body').html(response);
							$('#dataModal .modal-body').css('overflow-y', 'auto');
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
			}
		}
	});

	$(document).on('click','.saveFieldChanges',function(){
		data = $('#saveEditOption').serialize();
		$.ajax({
			data : data,
			type : "post",
			url : "/DataEdit/updateData",
			success : function(response)
			{
				if(response)
				{
					$('#dataModal .close').click();
					$('#getData').click();
				}else{
					alert('Error occured.');
				}
			}
		});
	});

	// $('.saveFieldChanges')
});