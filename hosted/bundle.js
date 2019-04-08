'use strict';

var loadDomosFromServer = function loadDomosFromServer() {
	//Get the token, once that is done get the domos
	sendAjax('GET', '/getToken', null, function (tokenData) {
		sendAjax('GET', '/getDomos', null, function (data) {
			ReactDOM.render(
			//Added the csrf token for the very first time we call DomoList
			React.createElement(DomoList, { domos: data.domos, csrf: tokenData.csrfToken }), document.querySelector("#domos"));
		});
	});
};

var handleDomo = function handleDomo(e) {
	e.preventDefault();

	$("#domoMessage").animate({ width: 'hide' }, 350);

	if ($("#domoName").val() == '' || $("#domoAge").val() == '') {
		handleError("RAWR! All fields are required");
		return false;
	}

	sendAjax('POST', $("#domoForm").attr("action"), $("#domoForm").serialize(), function () {
		loadDomosFromServer();
	});

	return false;
};

var removeDomo = function removeDomo(e) {
	//Refactored remove domo to properly work with how it is being used. It now takes in an
	//event object. That object represents the specific domo form we are trying to delete.
	e.preventDefault();

	$("#domoMessage").animate({ width: 'hide' }, 350);

	//We can get the id and csrf token from the form and construct our form data from that.
	var domoId = e.target.querySelector('#_id').defaultValue;
	var domoCsrf = e.target.querySelector('#csrf').defaultValue;
	var formData = '_id=' + domoId + '&_csrf=' + domoCsrf;

	//We can construct a request by getting the method (post) and the action (/deleteDomo)
	//out of the form in the event (e) object.
	var xhr = new XMLHttpRequest();
	xhr.open(e.target.method, e.target.action);

	//Setup our headers
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader('Accept', 'application/json');

	//Send the request, and get all the domos from the server so the page refreshes
	xhr.send(formData);
	loadDomosFromServer();

	return false;
};

var DomoForm = function DomoForm(props) {
	return React.createElement(
		'form',
		{ id: 'domoForm',
			onSubmit: handleDomo,
			name: 'domoForm',
			action: '/maker',
			method: 'POST',
			className: 'domoForm'
		},
		React.createElement(
			'label',
			{ htmlFor: 'name' },
			'Name: '
		),
		React.createElement('input', { id: 'domoName', type: 'text', name: 'name', placeholder: 'Domo Name' }),
		React.createElement(
			'label',
			{ htmlFor: 'age' },
			'Age: '
		),
		React.createElement('input', { id: 'domoAge', type: 'text', name: 'age', placeholder: 'Domo Age' }),
		React.createElement(
			'label',
			{ htmlFor: 'level' },
			'Level: '
		),
		React.createElement('input', { id: 'domoLevel', type: 'text', name: 'level', placeholder: '1' }),
		React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
		React.createElement('input', { className: 'makeDomoSubmit', type: 'submit', value: 'Make Domo' })
	);
};

var DomoList = function DomoList(props) {
	if (props.domos.length === 0) {
		return React.createElement(
			'div',
			{ className: 'domoList' },
			React.createElement(
				'h3',
				{ className: 'emptyDomo' },
				'No Domos yet'
			)
		);
	}

	var domoNodes = props.domos.map(function (domo) {
		//Added in the domo._id value, and the props.csrf value
		return React.createElement(
			'form',
			{ id: 'domoList',
				onSubmit: removeDomo,
				name: 'domoList',
				action: '/deleteDomo',
				method: 'POST',
				className: 'domoList'
			},
			React.createElement(
				'div',
				{ key: domo._id, className: 'domo' },
				React.createElement('img', { src: '/assets/img/domoface.jpeg', alt: 'domo face', className: 'domoFace' }),
				React.createElement(
					'h3',
					{ className: 'domoName' },
					' Name: ',
					domo.name,
					' '
				),
				React.createElement(
					'h3',
					{ className: 'domoAge' },
					' Age: ',
					domo.age,
					' '
				),
				React.createElement(
					'h3',
					{ className: 'domoLevel' },
					' Level: ',
					domo.level,
					' '
				),
				React.createElement('input', { id: '_id', type: 'hidden', name: '_id', value: domo._id }),
				React.createElement('input', { id: 'csrf', type: 'hidden', name: '_csrf', value: props.csrf }),
				React.createElement('input', { type: 'submit', value: 'Delete Domo' })
			)
		);
	});

	return React.createElement(
		'div',
		{ className: 'domoList' },
		domoNodes
	);
};

var setup = function setup(csrf) {
	ReactDOM.render(React.createElement(DomoForm, { csrf: csrf }), document.querySelector("#makeDomo"));

	// When we render the page, we need to add csrf={csrf} to add the token to the props object
	ReactDOM.render(React.createElement(DomoList, { domos: [], csrf: csrf }), document.querySelector("#domos"));

	loadDomosFromServer();
};

var getToken = function getToken() {
	sendAjax('GET', '/getToken', null, function (result) {
		setup(result.csrfToken);
	});
};

$(document).ready(function () {
	getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var redirect = function redirect(response) {
  $("#domoMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
