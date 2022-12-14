$(document).ready(function(){
	$('#users thead tr#filterrow th').each(function () {
        var title = $('#users thead th').eq($(this).index()).text();
        $(this).html('<input type="text" onclick="stopPropagation(event);" placeholder="Search ' + title + '" />');
    });

    // DataTable
    var table = $('#users').DataTable({
        orderCellsTop: true,
        iDisplayLength: 25
    });

    // Apply the filter
    $("#users thead input").on('keyup change', function () {
        table
            .column($(this).parent().index() + ':visible')
            .search(this.value)
            .draw();
    });
});