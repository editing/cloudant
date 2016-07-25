/* global $,monaco:monaco,require:require */

require.config({ paths: { 'vs': '/node_modules/monaco-editor/min/vs' } });
var PromiseMonaco = new Promise((resolve) => {
	require(['vs/editor/editor.main'], () => resolve());
});

/** @type {monaco.editor.IStandaloneCodeEditor} */
var editor;
/** @type {monaco.editor.IStandaloneCodeEditor} */
var hierachy;

/* exported */
function Body($scope) {
	var redirect	= sessionStorage.redirect;
	if(redirect)
	{
		history.pushState(null,null,redirect);
		delete sessionStorage.redirect;
	}

	PromiseMonaco.then(() => {
		if (!hierachy) {
			hierachy = monaco.editor.create(document.getElementById('hierachy'), { language: 'json',wrappingColumn:-1 });
			hierachy.getModel().detectIndentation(false,4);
		}
	
		hierachy.setValue(JSON.stringify(redirect,null,"\t"));
	});

	function Cloudant(method, path) {
		return $.get({
			method: method,
			headers: { Authorization: "Basic " + btoa($scope.user + ":" + $scope.pass) },
			url: "https://" + $scope.domain + ".cloudant.com" + encodeURI(path)
		});
	}

	$scope.login = function ($event) {
		$event.preventDefault();
		Cloudant("GET", "/_users/_all_docs?startkey=\"_design/\"&endkey=\"_design/\uFFFF\"").then((data, status) => {
			$scope.status = status;
			$scope.$apply();
			return data;
		}, (req, status, err) => {
			console.error(err);
			$scope.status = status;
			$scope.$apply();
		}).then((data) => {
			return PromiseMonaco.then(() => data);
		}, (err) => console.error(err)).then((data) => {
			if (!editor) {
				editor = monaco.editor.create(document.getElementById('container'), { language: 'json',wrappingColumn:-1 });
				editor.getModel().detectIndentation(false,4);
			}

			editor.setValue(JSON.stringify(data,null,"\t"));
		});
	};
}
