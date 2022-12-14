$(document).ready(function(){
	$('#odkData thead tr#filterrow th').each(function () {
        var title = $('#odkData thead th').eq($(this).index()).text();
        $(this).html('<input type="text" onclick="stopPropagation(event);" placeholder="Search ' + title + '" />');
    });

    // DataTable
    var table = $('#odkData').DataTable({
        orderCellsTop: true,
        iDisplayLength: 25
    });

    // Apply the filter
    $("#odkData thead input").on('keyup change', function () {
        table
            .column($(this).parent().index() + ':visible')
            .search(this.value)
            .draw();
    });
});