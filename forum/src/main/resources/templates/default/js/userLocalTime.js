String.prototype.toLocaleDateTime = function() {
	<#if useLocalTime>
		var date = new Date(this.toString());
		var userOffsetFromGmt = getUserOffsetInHoursFromGmt();
		date.setMilliseconds(date.getMilliseconds() - userOffsetFromGmt*3600000);
		printWithTodayYesterdayFormatting(date);
	<#else>
		document.write(this.toString());
	</#if>
}

function printWithTodayYesterdayFormatting (date) {
	var localDate = date.toLocaleDateString();
	var date2 = new Date();
	var localToday = date2.toLocaleDateString();
	date2.setTime(date2.getTime() - 24*3600000);
	var localYesterday = date2.toLocaleDateString();

	if (localDate == localToday) {
		localDate = "${I18n.getMessage("today")}";
	} else if (localDate == localYesterday) {
		localDate = "${I18n.getMessage("yesterday")}";
	}
	var localTime = date.toLocaleTimeString().replace(/(\d\d?\:\d\d)\:00/,"$1");

	document.write(localDate + " " + localTime);
}

function getUserOffsetInHoursFromGmt() {
	var date = new Date();
	return date.getTimezoneOffset() / 60;
}

