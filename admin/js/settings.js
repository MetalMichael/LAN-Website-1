$(document).ready(function() {

    //Time pickers
    $(".setting-date").datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat: "hh:mm:ss",
        setDate: new Date($(this).prop('value'))
        });

    
    //Save button
    $("#save-settings").click(function() { saveSettings(); });
    
});

function saveSettings() {

    var settings = {};

    $(".setting input").each(function() {
    
        var name = $(this).prop('name');
        var val = $(this).prop('value');
        
        //Bool inputs
        if ($(this).hasClass('setting-bool')) {
            settings[name] = ($(this).is(':checked')?1:0);
        }
        //Integer inputs
        else if ($(this).hasClass('setting-int')) {
            if (!isNaN(val)) {
                settings[name] = val;
                $(this).css('box-shadow', '0px 0px 0px orange');
            } else {
                $(this).css('box-shadow', '0px 0px 5px red');
            }
        }
        //All others
        else {
            if (val.length > 0) {
                settings[name] = val;
                $(this).css('box-shadow', '0px 0px 0px orange');
            } else {
                $(this).css('box-shadow', '0px 0px 5px red');
            }
        }
    
    });
    
    $.post(
        UrlBuilder.buildUrl(true, "settings", "savesettings"),
        { settings: JSON.stringify(settings) },
        function(response) {
            if (!response) alert("An error occurred");
            else {
                Overlay.openOverlay(false, "Settings Saved Successfully", 1000);
            }
        });

}