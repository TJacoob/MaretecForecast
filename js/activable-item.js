$(document).ready(function() {
	/**
	 *	This is a local context.
	 *
	 *  To present and to manipulate a full-page map.
	 *  A div with class "full-map" must be added to HTML.
	 */
	window.activateActivableItens = function activateActivableItens() {
	//$(document).ajaxStop(function() { // tem de ser substituido mas e necessario algo assim, pq ele so age quando os elementos ja foram loaded
		$(".activable:not(.disabled)").on("click", function() {
			var itemId = $(this).attr("name");
			$("[name=\"" + itemId + "\"]").removeClass("active");
			$(this).addClass("active");
			$("[name=\"" + itemId + "\"]").find("input").prop("checked", false);
			$(this).find("input").prop("checked", true);
		});
	}
	//});
});