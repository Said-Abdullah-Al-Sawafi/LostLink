// LostLink - custom jQuery behaviour
$(function () {

    // 1) Live match preview on Report Found: AJAX + debounce ---------------
    var previewTimer = null;
    $("form[data-preview='true'] input, form[data-preview='true'] select, " +
      "form[data-preview='true'] textarea")
        .on("input change", function () {
            clearTimeout(previewTimer);
            previewTimer = setTimeout(loadPreview, 350);   // wait for typing pause
        });

    function loadPreview() {
        var q = "category="     + encodeURIComponent($("#Found_Category").val() || "")
              + "&colour="      + encodeURIComponent($("#Found_Colour").val() || "")
              + "&brand="       + encodeURIComponent($("#Found_Brand").val() || "")
              + "&location="    + encodeURIComponent($("#Found_Location").val() || "")
              + "&dateFound="   + encodeURIComponent($("#Found_DateFound").val() || "")
              + "&description=" + encodeURIComponent($("#Found_Description").val() || "");

        $.getJSON("/ReportFound?handler=Preview&" + q)
            .done(function (matches) {
                var $box = $("#matchPreview").hide().empty();
                if (matches.length === 0) {
                    $box.append("<div class='alert alert-info mb-0 small'>" +
                        "No lost report matches yet - keep filling the form.</div>");
                } else {
                    $.each(matches, function (i, m) {
                        var tone = m.level === "High" ? "success" : "warning";
                        $box.append(
                            "<div class='card mb-2 border-" + tone + "'>" +
                              "<div class='card-body py-2'>" +
                                "<strong>" + m.score + "/100 · " + m.level +
                                  " potential</strong><br/>" +
                                "<span class='small'>" + m.lostSummary + "</span>" +
                                "<ul class='small mb-0 mt-1'>" +
                                  $.map(m.reasons, function (r) {
                                      return "<li>" + r + "</li>";
                                  }).join("") +
                                "</ul>" +
                              "</div>" +
                            "</div>");
                    });
                }
                $box.fadeIn("fast");                 // 2) effects
            })
            .fail(function () {
                $("#matchPreview").html(
                    "<div class='text-muted small'>Preview unavailable.</div>");
            });
    }

    // 3) Live filtering on Browse -------------------------------------------
    $("#searchBox").on("keyup", function () {
        var q = $(this).val().toLowerCase();
        $("table.data-table tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(q) !== -1);
        });
    });

    $("#categoryFilter").on("change", function () {
        var cat = $(this).val();
        $("table.data-table tbody tr").each(function () {
            $(this).toggle(!cat || $(this).data("category") === cat);
        });
    });

    // 4) Character counter for the description fields -----------------------
    $("textarea[data-counter]").on("input", function () {
        var len = $(this).val().length;
        $($(this).data("counter")).text(len + " / 400 characters");
    }).trigger("input");    // show the current length on page load too

    // 5) Match Centre: click a row to expand the scoring reasons ------------
    $("tr[data-reasons]").on("click", function () {
        $(this).next("tr.reasons").toggle();         // slideToggle() also fine
    });

    // 6) Confirmation before submitting a claim ------------------------------
    $("form[data-confirm]").on("submit", function (e) {
        if (!window.confirm($(this).data("confirm"))) e.preventDefault();
    });

    // 7) Claims desk: highlight the row when a decision is made -------------
    $("form[data-decision]").on("submit", function () {
        $(this).closest("tr")
            .addClass($(this).data("decision") === "approve"
                ? "table-success" : "table-danger");
    });

    // 8) Home page: animate the statistic counters ---------------------------
    $(".stat-count").each(function () {
        var $el = $(this);
        var target = parseInt($el.data("count"), 10) || 0;
        $({ n: 0 }).animate({ n: target }, {
            duration: 900,
            easing: "swing",
            step: function (now) { $el.text(Math.round(now)); },
            complete: function () { $el.text(target); }
        });
    });
});
