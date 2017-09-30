function VideoStats() {
    var statsTableId = "statsTable";
    var videoId = "video";
    var videoElement = "";
    var statsTableElement = "";
    var startTime = 0;
    var updateIntervalId = "";
    var updateInterval = 2000;
    var frameDropRateLimit = 0; //minimum is 0.01 (in %)
    var stats = [{
        "header" : "Video Width", // Table header
        "id" : "videoWidth", // Element ID
        "attribute" : "videoWidth", // Data
    }, {
        "header" : "Video Height",
        "id" : "videoHeight",
        "attribute" : "videoHeight",
    },{
        "header" : "Dropped Frames",
        "id" : "droppedFrameCount",
        "attribute" : "webkitDroppedFrameCount",
    }, {
        "header" : "Decoded Video Frames",
        "id" : "decodedFrameCount",
        "attribute" : "webkitDecodedFrameCount",
    }, {
        "header" : "FPS",
        "id" : "fps",
    }, {
        "header" : "Playback Rate",
        "id" : "playbackRate",
    }, {
        "header" : "Dropped Rate",
        "id" : "droppedFrameRate",
    }, {
        "header" : "Decoded Video Bytes",
        "id" : "decodedVideoByteCount",
        "attribute" : "webkitVideoDecodedByteCount",
    }, {
        "header" : "Decoded Audio Bytes",
        "id" : "decodedAudioByteCount",
        "attribute" : "webkitAudioDecodedByteCount",
    }];

    var init = function() {
        videoElement = document.getElementById(videoId);
        statsTableElement = document.getElementById(statsTableId);

        $(statsTableElement).append("<tbody></tbody>");
        for (var x in stats) {
            $(statsTableElement).append("<tr><td>" + stats[x].header + "</tr></td");
            $(statsTableElement).append("<tr><td id=" + stats[x].id + " ></td></tr>");
        }

        // Setup callback for when the video starts and ends
        $(videoElement).bind("playing", videoStarted);
        $(videoElement).bind("ended", videoEnded);

        videoElement.play();
    };

    var videoStarted = function() {
        if (startTime == 0){
            startTime = getCurrentTime();
            updateIntervalId = setInterval(updateStats, updateInterval);
        }
    };

    var videoEnded = function() {
        // Stop updating stats
        clearInterval(updateIntervalId);

        var testPass = getPlaybackSuccess();

        $("#playbackContainer").prepend('<div id="finalResultRow" class="row"></div>')
        if (testPass) {
            $("#finalResultRow").append('<div id="finalResult" class="alert alert-success text-center">Pass</div>');
        } else {
            $("#finalResultRow").append('<div id="finalResult" class="alert alert-danger text-center">Fail</div>');
        }

    };

    // Checks the stats table for the "success" classname
    var getPlaybackSuccess = function () {
        var cellIds = ["#playbackRate", "#droppedFrameRate"];
        for (var x in cellIds) {
            if ($(cellIds[x]).hasClass("success") == false) {
                return false;
            }
        }
        return true;
    };

    var updateStats = function() {
        var data;
        var tableCell;

        for ( var x in stats) {
            tableCell = document.getElementById(stats[x].id);

            if (stats[x].id == "playbackRate") {
                var elTime = (getCurrentTime() - startTime) / 1000;
                data = Math.floor(videoElement.currentTime / elTime * 100 + .5);
                if (data < 100) {
                    tableCell.className = "danger";
                } else {
                    tableCell.className = "success";
                }
                data += "%";
            } else if (stats[x].id == "fps") {
                var elTime = (getCurrentTime() - startTime) / 1000;
                data = Math.floor(videoElement.webkitDecodedFrameCount / elTime
                                  + .5);
            } else if (stats[x].id == "droppedFrameRate") {
                var rate = videoElement.webkitDroppedFrameCount
                           / videoElement.webkitDecodedFrameCount * 10000;
                rate = Math.floor(rate);
                rate = rate / 100;

                if (rate > frameDropRateLimit) {
                    tableCell.className = "danger";
                } else {
                    tableCell.className = "success";
                }

                data = rate + "%";
            } else {
                data = videoElement[stats[x].attribute];
            }

            tableCell.innerHTML = data;
        }
    };

    var getCurrentTime = function() {
        if (window.performance.now)
            return window.performance.now();
        else
            return new Date().getTime();
    };

    this.start = function() {
        init();
    };
}

function YAHVP() {
    var availableVideosPath = "video/videos.json";
    var availableVideos = "";
    var selectedVideoParam = "id";
    var selectedVideo = "";
    var playbackContainerId = "playbackContainer";
    var playbackContainer = "";
    var selectionContainerId = "selectionContainer";
    var selectionContainer = "";
    var videoId = "video";
    var videoElement = "";
    var videoStats = new VideoStats;

    // From http://stackoverflow.com/a/901144
    var getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var init = function() {
        playbackContainer = document.getElementById(playbackContainerId);
        selectionContainer = document.getElementById(selectionContainerId);
        videoElement = document.getElementById(videoId);

        selectedVideo = getParameterByName(selectedVideoParam);

        setupLayout();
    };

    var setupLayout = function() {
        if (verifyVideoId(selectedVideo)) {
            var source = createVideoSource(selectedVideo);
            videoElement.appendChild(source);
            videoStats.start();
            $(playbackContainer).removeClass("hidden");
        } else {
            var row;
            for (var x in availableVideos.videos) {
                // Start a new row
                if (x % 3 == 0) {
                    row = document.createElement("div");
                    row.className = "row";
                    selectionContainer.appendChild(row);
                }

                var div = createVideoSplashDiv(availableVideos.videos[x]);
                row.appendChild(div);
            }

            $(selectionContainer).removeClass("hidden");
        }
    };

    var createVideoSplashDiv = function (vid) {
        var div = document.createElement("div");
        var caption = document.createElement("div");
        var captionTitle = document.createElement("h4");
        var a = document.createElement("a");
        var img = document.createElement("img");

        div.className = "col-md-4 thumbnail";
        caption.className = "caption";
        a.className = "";
        a.href = "?id=" + vid.id;
        img.src = "video/" + vid.folder + "/" + vid.thumbnail;

        a.appendChild(img);
        div.appendChild(a);

        captionTitle.innerHTML = vid.description;
        caption.appendChild(captionTitle);

        var labels = ["type", "fps", "resolution", "acodec", "vcodec"];
        for (var x in labels) {
            if (vid[labels[x]]) {
                var label = document.createElement("span");
                label.className = "label label-default";
                label.innerHTML = labels[x] + ": " + vid[labels[x]];
                caption.appendChild(label);

                var spacer = document.createElement("span");
                spacer.innerHTML = " ";
                caption.appendChild(spacer);
            }
        }

        div.appendChild(caption);
        return div;
    };

    // Check that the selected ID is in the available video list
    var verifyVideoId = function(id) {
        for (var x in availableVideos.videos) {
            if (id == availableVideos.videos[x].id) {
                return true;
            }
        }
        return false;
    };

    // Create a source element for the selected ID
    var createVideoSource = function (id) {
        var source = null;

        for (var x in availableVideos.videos) {
            if (id == availableVideos.videos[x].id) {
                var vid = availableVideos.videos[x];
                source = document.createElement("source");
                source.src = "video/" + vid.folder + "/" + vid.file;
                source.type = vid.type;
            }
        }

        return source;
    };

    this.start = function() {
        $.getJSON(availableVideosPath, function(json) {
            availableVideos = json;
            init();
        });
    };
}

var yahvp = new YAHVP;
yahvp.start();
