$(document).ready(function() {

    getTimetable();

});

function getTimetable() {
    $.get(
        UrlBuilder.buildUrl(false, "whatson", "gettimetable"),
        function (data) {
            //Timetable
            for (var i = 0; i < data.timetable.length; i++) {
            
                var row = data.timetable[i];
                
                //Form entry string
                var string = '';
                if (row.url) string += '<a class="entry-link" href="' + row.url + '">';
                string += '<div class="timetable-entry" id="entry' + row.timetable_id + '">' + row.title + '</div>';
                if (row.url) string += '</a>';
                $('#' + row.day).append(string);
                
                //Set entry properties
                var entry = $("#entry" + row.timetable_id);
                entry.addClass(row.colour);
                var position1 = $("#" + row.day + ' .time-row[value="' + row.start_time + '"]').position();
                var position2 = $("#" + row.day + ' .time-row[value="' + row.end_time + '"]').position();
                entry.css('top', position1.top);
                entry.css('width', 270/row.division -20);
                
                if (row.previous) {
                    var position3 = $("#entry" + row.previous).position();
                    entry.css('left', $("#entry" + row.previous).width() + position3.left + 20);
                } else {
                    entry.css('left', 0);
                }
                entry.css('height', position2.top - position1.top -20);
                
            }
            
            //Committee
            $("#committee-timetable-body").html("");
            var day;
            var string = "";
            for (var i = 0; i < data.committee.length; i++) {            
                var row = data.committee[i];
                
                //New day
                if(row.day != day) {
                    if(string != "") {
                        $("#committee-timetable-body").append(string);
                    }
                    
                    day = row.day;
                    string = '<span class="committee-day">' + day + '</span>';
                }
                
                string += '<span class="committee-username">' + data.users[row.user_id].username + '</span>';
            }
            $("#committee-timetable-body").append(string);
        },
        'json');
}
