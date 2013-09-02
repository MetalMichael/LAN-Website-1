$(document).ready(function() {

    //Bind click
    $("#new-submit").live("click", function() {
        tournaments.submitNew();
    });
    
        
    //Date/Time pickers
    $('.time-picker').timepicker();
    
    //Load entries
    tournaments.loadEntries();
    
    /*
    //Entry click
    $(".entry-row").live("click", function() {
        tournaments.clickRow(this);
    });
    
    /*
    //Buttons
        //Disable buttons
    $("#delete-tournament, #empty-signups, #view-signups").button('disable');

        //Delete button
    $("#delete-tournament").live("click", function() {
        tournaments.deleteButton();
    });
    
        //Empty button
    $("#empty-signups").live("click", function() {
        tournaments.emptyButton();
    });
    
        //View button
    $("#view-signups").live("click", function() {
        tournaments.viewButton();
    });
    */

});

var tournaments = {
    //selectedID: null,
    //selectedRow: null,
    
    loadEntries: function() {
        $.get(
            UrlBuilder.buildUrl(true, 'tournaments', 'getentries'),
            function (data) {
                $("#entry-table").html("");
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var row = data[i];
                        
                        var link = Urlbuilder.buildUrl(false, 'tournaments', 'view', array('id'=>row.id));
                        link = '<a href="' + link + '">' + row.game_name + '</a>';
                        
                        var string = '<div id="tournament-' + row.id + '">';
                        string = '<h2>' + data.name + '</h2>';
                        string += '<div id="tournament-table">';
                        string += '<div class="row"><span class="field id">ID</span><span class="value id">' + row.id + '</span></div>';
                        string += '<div class="row"><span class="field game">Game</span><span class="value game">' + link + '</span></div>';
                        string += '<div class="row"><span class="field team-size">Team Size</span><span class="value team-size">' + row.team_size + '</span></div>';
                        string += '<div class="row"><span class="field type">Tournament Type</span><span class="value type">' + row.type_name + '</span></div>';
                        string += '<div class="row"><span class="field start">Start Time</span><span class="value start">' + row.start_time + '</span></div>';
                        string += '<div class="row"><span class="field end">End Time</span><span class="value end">' + row.end_time + '</span></div>';
                        string += '<div class="row"><span class="field signup-end">Signups Close</span><span class="value signup-end">' + row.signup_end + '</span></div>';
                        string += '<div class="row"><span class="field signups">Signups?</span><span class="value signups"><input type="checkbox" class="signup-checkbox" ' + ((row.signups) ? 'checked="checked"' : '') + ' /></span></div>';
                        string += '<div class="row"><span class="field visible">Visible?</span><span class="value visible"><input type="checkbox" class="visible-checkbox" ' + ((row.visible) ? 'checked="checked"' : '') + ' /></span></div>';
                        string += '<div class="row"><span class="field current-signups">Current Signups</span><span class="value current-signups">' + row.current_signups + '</span></div>';
                        string += '<div class="row"><span class="field description">Description</span><span class="value description">' + row.description + '</span></div>';
                        string += '</div>';
                        
                        string += '<div class="buttons">';
                        string += '<button class="delete-tournament" onclick="tournaments.deleteButton(' + row.id + ')">Delete Tournament</button>';
                        string += '<button class="empty-signups" onclick="tournaments.emptyButton(' + row.id + ')">Empty Signups</button>';
                        string += '<button class="view-signups" onclick="tournaments.viewButton(' + row.id + ')">View Signups</button>';
                        string += '</div>';
                        string += '</div>';
                                                
                        $("#entry-table").append(string);
                    }
                } else {
                    $("#table-body").append('<div class="no-entries">No tournaments found</div>');
                }
            },
            'json');
    },
    
    submitNew: function() {
        Overlay.loadingOverlay();
        $.post(
            UrlBuilder.buildUrl(true, 'tournaments', 'add'), {
                game: $("#new-game").val(),
                name: $("#new-name").val(),
                teamsize: $("#new-team-size").val(),
                type: $("#new-type").val(),
                description: $("#new-description").val(),
                start: $("#new-start").val(),
                end: $("#new-end").val(),
                signup_end: $("#new-signups-end").val(),
                signups: $("#new-signups").prop('checked'),
                visible: $("#new-visible").prop('checked'),
            },
            function (data) {
                if (data != null && data.error) {
                    Overlay.openOverlay(true, data.error);
                    return;
                }
                Overlay.openOverlay(false, "Tournament added", 1000);
                tournaments.loadEntries();
                tournaments.clearForm();
            },
            'json');
    },
    
    clearForm: function() {
        //$("#add-tournament input").val('');
    },
    /*
    clickRow: function(row) {
        this.selectedID = $(row).find(".id").html();
        this.selectedRow = $(row);
        $(".entry-row").removeClass("selected-row");
        $(row).addClass("selected-row");

        $("#delete-tournament, #empty-signups, #view-signups").button('enable');
    },
    */
    deleteButton: function(selectedID) {
        if(!selectedID) return;
        
        Overlay.openOverlay(true, 'Are you sure you wish to delete this tournament? This cannot be undone!<br /><button id="confirm-delete">I am sure</button>');
        $("#confirm-delete").button();
        $("#confirm-delete").click(function() {
            $.post(
                UrlBuilder.buildUrl(true, "tournaments", "delete"),
                { tournament_id: selectedID },
                function (data) {
                    if (data != null && data.error) {
                        Overlay.openOverlay(true, data.error);
                        return;
                    }
                    tournaments.loadEntries();
                    //entry_id = false;
                    //$(".entry-row").removeClass("selected-row");
                    //$("#delete-tournament, #empty-signups, #view-signups").button('disable');
                    Overlay.openOverlay(false, "Tournament deleted", 1000);
                },
                'json');
        });
    },
    
    emptyButton: function(selectedID) {
        if(!selectedID) return;
        if(this.selectedRow.find(".current-signups").html() == '0') {
            Overlay.openOverlay(false, "This tournament has no signups!", 1000);
            return;
        }
        
        Overlay.openOverlay(true, 'Are you sure you wish to empty signups for this tournament? This cannot be undone!<br /><button id="confirm-delete">I am sure</button>');
        $("#confirm-delete").button();
        $("#confirm-delete").click(function() {
            $.post(
                UrlBuilder.buildUrl(true, "tournaments", "empty"),
                { tournament_id: selectedID },
                function (data) {
                    if (data != null && data.error) {
                        Overlay.openOverlay(true, data.error);
                        return;
                    }
                    tournaments.loadEntries();
                    //entry_id = false;
                    //$(".entry-row").removeClass("selected-row");
                    //$("#delete-tournament, #empty-signups, #view-signups").button('disable');
                    Overlay.openOverlay(false, "Tournament signups emptied", 1000);
                },
                'json');
        });
    },
    
    viewButton: function(selectedID) {
        if(!selectedID) return;
        window.location = UrlBuilder.buildUrl(true, 'tournaments', 'view', {id:selectedID});
    }
}