var server = "http://desamovil.cl:3001";
var service = {
	getLists: function (_fun) {
	    $.ajax({
	    	type: "GET",
           	dataType: "json",
           	url: server + '/listas/list.json',
           	success: function (listas) {
               _fun(listas.data);
           	}
       	});
	},
	setNewList: function (listItem, _fun) {
		$.ajax({
			type: "POST",
			dataType: "json",
			url: server + '/listas/new',
			contentType: 'application/json',
			data: JSON.stringify(listItem),
			success: function (response) {
				_fun(response);
			}
       	});
	},
	updateList: function (list, _fun) {
		$.ajax({
	    	type: "POST",
			dataType: "json",
			url: server + '/listas/' + list._id,
			contentType: 'application/json',
			data: JSON.stringify(list),
           	success: function (response) {
               _fun(response);
           	}
       	});
	}
};