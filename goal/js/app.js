let currentView = "home";
let detailView,
  tabContentViews,
  detailTitle,
  detailImage,
  detailCategory,
  detailTime,
  detailText;
let bottomNav, adBanner, headerTitle, backButton, contentSections, tabs;

const getHeaderTitle = (targetId) => {
  switch (targetId) {
    case "home-content":
      return "اخر الاخبار";
    case "scores-content":
      return "جدول المباريات";
    case "teams-content":
      return "جدول الترتيب";
    case "settings-content":
      return "الإعدادات";
    default:
      return "يلا جول";
  }
};

const createMatchCard = (match) => {
  const isLive = match.isLive;
  // const isLive = true;
  const centerTxt = isLive
    ? '<span class="live-text text-red-600 font-bold">جارية الان</span>'
    : "-";
  const notStarted = match.status === "لم تبدأ";

  return `
        <div onclick="showMatchDetail(${match.id});"
            class="match-card bg-white rounded-xl shadow-md p-4 transition duration-300 hover:shadow-lg border-r-4 ${
              isLive ? "border-red-500" : "border-gray-300"
            } space-y-2">
            
            <div class="text-xs font-medium text-gray-500 text-right border-b border-gray-100 pb-2 mb-2" style="display: flex;
    align-items: center;
    gap: 5px;">
                <img src="https://imagecache.365scores.com/image/upload/f_png,w_20,h_20,c_limit,q_auto:eco,dpr_3,d_Countries:Round:122.png/v2/Competitions/light/
${
  match.leagueId
}" style="width: 25px;height: 25px;" /> <span style="font-size:16px;font-weight:bold;">${
    match.league
  }</span>
            </div>

            <div class="flex items-center justify-between">
                
                <div class="flex flex-col items-center w-1/3 text-right">
                    <img src="https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_Competitors:default1.png/Competitors/${
                      match.homeId
                    }" alt="${match.teamA}">
                    <span class="text-sm font-semibold text-center text-gray-800 mt-1">${
                      match.teamA
                    }</span>
                </div>

                <div class="flex flex-col items-center w-1/3 text-center">
                    
                    <span class="sfont block mt-1">${match.status}</span>
                    ${
                      notStarted
                        ? `<span class="bg-green-600 text-white px-2 py-[2px] rounded-md text-xs font-bold mt-1 inline-block">
                            ${(() => {
                              let d = new Date(match.startTime);
                              return d.toLocaleTimeString("ar-EG", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              });
                            })()}
                        </span>`
                        : ""
                    }

                    <div class="text-lg font-bold text-gray-400 mt-1">${
                      match.scoreA !== null ? match.scoreA : "-"
                    } : ${match.scoreB !== null ? match.scoreB : "-"}</div>
                </div>

                <div class="flex flex-col items-center w-1/3 text-left">
                    <img src="https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_Competitors:default1.png/Competitors/${
                      match.awayId
                    }" alt="${match.teamB}">
                    <span class="text-sm font-semibold text-center text-gray-800 mt-1">${
                      match.teamB
                    }</span>
                </div>

            </div>
        </div>
    `;
};

const renderMatches = (dateFilter) => {
  const container = $("#match-list-container");
  container.html("");

  $.ajax({
    url: "https://smartdb.smartselwady.org/LiveStreamMatchsIDs_View",
    method: "GET",
    dataType: "json",
    success: function (res) {
      const fetchDB = JSON.parse(res.results[0].fetchDB);

      let matchIDIndex;
      if (dateFilter === "yesterday") matchIDIndex = 1;
      else if (dateFilter === "today") matchIDIndex = 0;
      else if (dateFilter === "tomorrow") matchIDIndex = 2;

      const req_url = `https://webws.365scores.com/web/games/?langId=27&timezoneName=Asia/Riyadh&userCountryId=-1&appTypeId=5&games=${fetchDB[matchIDIndex].id}&startDate=23/11/1999&endDate=23/11/2030`;

      $.ajax({
        url: req_url,
        method: "POST",
        dataType: "json",
        success: function (result) {
          if (
            result.ttl === "5" ||
            !result.games ||
            result.games.length === 0
          ) {
            container.html(`
                            <div class="bg-gray-50 p-6 rounded-xl text-center text-gray-600 shadow-inner mt-4">
                                <p class="text-lg font-semibold">لا توجد مباريات مقررة ${
                                  dateFilter === "yesterday"
                                    ? "بالأمس"
                                    : dateFilter === "today"
                                    ? "اليوم"
                                    : "غداً"
                                }.</p>
                            </div>
                        `);
            return;
          }

          const statusOrder = {
            "الشوط الأول": 0,
            شوط: 1,
            "الشوط الثاني": 2,
            "لم تبدأ": 3,
            "انتهت للتو": 4,
            انتهت: 5,
            "بعد ركلات الترجيح": 6,
            "بعد الوقت الإضافي": 7,
          };

          result.games.sort((a, b) => {
            const getOrder = (game) => {
              return statusOrder[game.statusText] !== undefined
                ? statusOrder[game.statusText]
                : 99;
            };
            return getOrder(a) - getOrder(b);
          });

          result.games.forEach((game) => {
            const isLive = game.statusGroup === "4" || game.statusGroup === "2";

            const match = {
              id: game.id,
              teamA: game.homeCompetitor.name,
              homeId: game.homeCompetitor.id,
              teamB: game.awayCompetitor.name,
              awayId: game.awayCompetitor.id,
              scoreA:
                game.homeCompetitor.score >= 0
                  ? game.homeCompetitor.score
                  : null,
              scoreB:
                game.awayCompetitor.score >= 0
                  ? game.awayCompetitor.score
                  : null,
              status: isLive
                ? `جاري اللعب (${game.statusText})`
                : game.statusText,
              isLive: isLive,
              league: game.competitionDisplayName,
              leagueId: game.competitionId,
              startTime: game.startTime,
            };

            container.append(createMatchCard(match));
          });
        },
        error: function (xhr, status, error) {
          container.html(
            '<p class="text-center text-red-500">حدث خطأ في جلب بيانات المباريات.</p>'
          );
          console.error("Error fetching matches from 365Scores:", error);
        },
      });
    },
    error: function (xhr, status, error) {
      container.html(
        '<p class="text-center text-red-500">فشل في تحميل معرفات المباريات.</p>'
      );
      console.error("Error fetching match IDs:", error);
    },
  });
};

const switchDateTab = (selectedButton) => {
  document.querySelectorAll("#scores-content .date-tab").forEach((btn) => {
    btn.classList.remove("bg-cyan-800", "text-white", "shadow-md");
    btn.classList.add("text-gray-600", "hover:bg-white", "hover:shadow-sm");
  });

  selectedButton.classList.add("bg-cyan-800", "text-white", "shadow-md");
  selectedButton.classList.remove(
    "text-gray-600",
    "hover:bg-white",
    "hover:shadow-sm"
  );

  const dateFilter = selectedButton.dataset.date;
  renderMatches(dateFilter);
};

const loadContent = async (targetId, filename) => {
  const targetSection = document.getElementById(targetId);
  if (!targetSection) return;

  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    targetSection.innerHTML = html;

    if (targetId === "home-content") {
      attachNewsCardListeners();
    } else if (targetId === "scores-content") {
      attachScoreTabListeners();
    }
  } catch (error) {
    console.error(`Error loading content for ${targetId}:`, error);
    targetSection.innerHTML =
      '<div class="p-4 text-red-500">فشل في تحميل المحتوى.</div>';
  }
};

let fetchDB = [];
const limit = 20;
let start = 0;

const colors = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "indigo",
  "orange",
];

const attachNewsCardListeners = () => {
  const container = document.getElementById("home-content");

  container.innerHTML = "";

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".news-card");
    if (card) showNewsDetail(card);
  });

  $.ajax({
    url: "https://pub-a1533ea6e8c3450caf6b0d2cb13337db.r2.dev/news.json",
    type: "GET",
    dataType: "json",
    success: function (res) {
      fetchDB = res.map((item) => JSON.parse(item));
      start = 0;
      loadNextBatch();
    },
    error: function (xhr, status, error) {
      console.log("❌ Error:", error);
    },
  });
};


const loadNextBatch = () => {
  const end = start + limit;
  const batch = fetchDB.slice(start, end);

  batch.forEach((item, index) => {
    $("#home-content").append(`
      <div class="news-card bg-white rounded-xl shadow-lg p-4 transition duration-300 hover:shadow-xl border-r-4 border-gray-300 flex items-center cursor-pointer" 
          data-title="${item.title}" 
          data-image="${item.imgurl}"
          data-details="${item.countent}">

          <img
              src="assets/images/placeholder.png"
              data-src="${item.imgurl}"
              class="news-thumbnail"
              onload="this.dataset.src && (this.src=this.dataset.src);"
              onerror="this.src='assets/images/placeholder.png';"
          >

          <div class="flex-grow text-right">
              <h3 class="text-lg font-bold mb-1">${item.title}</h3>
          </div>
      </div>
    `);
  });

  start += limit;
};


$(window).scroll(function () {
  if (
    $(window).scrollTop() + $(window).height() >=
    $(document).height() - 200
  ) {
    if (start < fetchDB.length) {
      loadNextBatch();
    }
  }
});

const attachScoreTabListeners = () => {
  const dateTabs = document.querySelectorAll("#scores-content .date-tab");

  const todayButton = document.querySelector(
    '#scores-content .date-tab[data-date="today"]'
  );
  if (todayButton) switchDateTab(todayButton);
  else renderMatches("today");

  dateTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      switchDateTab(e.currentTarget);
    });
  });
};

const showNewsDetail = (card) => {
  const title = card.dataset.title;
  const image = card.dataset.image;
  const details = card.dataset.details;

  let tempDiv = document.createElement("div");
  tempDiv.innerHTML = details;
  tempDiv.querySelectorAll(".ql-clipboard, .ql-tooltip").forEach(el => el.remove());
  tempDiv.querySelectorAll(".ql-editor").forEach(el => el.removeAttribute("contenteditable"));

  document.getElementById("modalNewsTitle").textContent = title;
  document.getElementById("modalNewsImage").src = image;
  document.getElementById("modalNewsContent").innerHTML = tempDiv.innerHTML;

  document.getElementById("newsModal").classList.remove("hidden");

  document.getElementById("closeNewsModal").onclick = () => {
    document.getElementById("newsModal").classList.add("hidden");
  };

  document.getElementById("newsModal").onclick = (e) => {
    if (e.target.id === "newsModal") {
      document.getElementById("newsModal").classList.add("hidden");
    }
  };
};


const showMatchDetail = (matchId) => {
  contentSections.forEach((section) => section.classList.remove("active"));
  if (tabContentViews) tabContentViews.style.display = "none";
  if (detailView) detailView.style.display = "none";

  const matchDetailView = document.getElementById("match-detail-view");
  const tabMatchBtn = document.getElementById("tab-match");
  const tabChannelsBtn = document.getElementById("tab-channels");
  const tabMatch = document.getElementById("tab-content-match");
  const tabChannels = document.getElementById("tab-content-channels");
  const channelsList = document.getElementById("channels-list");

  matchDetailView.classList.remove("hidden");
  matchDetailView.style.opacity = 0;
  matchDetailView.style.transform = "translateY(10px)";

  $("#MatchData").attr(
    "src",
    "match-info?id=" + matchId
  );

  setTimeout(() => {
    matchDetailView.style.opacity = 1;
    matchDetailView.style.transform = "translateY(0)";
  }, 50);

  if (adBanner) adBanner.classList.add("hidden");
  if (headerTitle) {
    headerTitle.textContent = "تفاصيل المبارة";
    headerTitle.style = "margin-right: -30px;";
  }
  if (backButton) backButton.classList.remove("hidden");

  function activateTab(show, hide, btnActive, btnInactive) {
    show.classList.remove("hidden");
    hide.classList.add("hidden");

    btnActive.classList.add("text-cyan-800", "border-b-2", "border-cyan-800");
    btnInactive.classList.remove(
      "text-cyan-800",
      "border-b-2",
      "border-cyan-800"
    );
    btnInactive.classList.add("text-gray-600");
  }

  activateTab(tabMatch, tabChannels, tabMatchBtn, tabChannelsBtn);

  tabMatchBtn.onclick = () =>
    activateTab(tabMatch, tabChannels, tabMatchBtn, tabChannelsBtn);

  tabChannelsBtn.onclick = () => {
    activateTab(tabChannels, tabMatch, tabChannelsBtn, tabMatchBtn);

    channelsList.innerHTML = `<div class="text-center text-gray-600 py-4">جاري تحميل القنوات...</div>`;

    $.ajax({
      url: "https://smartdb.smartselwady.org/LiveStreamCh2_View",
      method: "GET",
      dataType: "json",
      success: function (res) {
        channelsList.innerHTML = "";
        var fetchDB = JSON.parse(res.results[0].fetchDB);
        localStorage.setItem("ChannlsData", JSON.stringify(fetchDB));

        $.ajax({
          url: "https://smartdb.smartselwady.org/LiveStreamMatchsAr_View",
          method: "GET",
          dataType: "json",
          success: function (matchRes) {
            var matchDB = JSON.parse(matchRes.results[0].fetchDB);
            var activeMatch = matchDB.find((m) => m.game_id == matchId);

            if (!activeMatch || !activeMatch.channels) {
              channelsList.innerHTML = `<div class="text-center text-gray-600 py-4">لا توجد قنوات متاحة لهذه المباراة</div>`;
              return;
            }

            var ids = activeMatch.channels.split(",").map(Number);

            fetchDB.forEach((ch) => {
              if (ids.includes(Number(ch.id))) {
                let card = $(`
                                    <div class="chanel-card bg-white rounded-xl shadow-lg mb-2 p-1 transition duration-300 hover:shadow-xl border-r-4 border-gray-300 flex items-center cursor-pointer ViewChannel"
                                        data-title="${ch.channel_name}"
                                        data-id="${ch.id}">
                                        <img src="${ch.channel_logo}" alt="${ch.channel_name}" class="chanel-thumbnail rounded-lg object-cover"
                                            onerror="this.onerror=null;this.src='https://placehold.co/100x80';">
                                        <div class="flex-grow text-right ">
                                            <span class="text-sm font-semibold text-gray-800 mt-1">${ch.channel_name}</span>
                                        </div>
                                    </div>
                                `);
                $(channelsList).append(card);
                card.show();
              }
            });

            $(".ViewChannel").off("click").on("click", function () {
            var channelId = $(this).data("id");
            var channelName = $(this).data("title");

                   $.ajax({
                url: 'https://yalla-vamos.online/AdminPanel/controller/ygoalRestApi.php',
                type: 'POST',
                data: {
                    api: 'get_channel',
                    id: channelId
                },
                dataType: 'json',
                success: function (data) {

                    var channelContent = data.code_3;

                    channelContent = $("<textarea/>").html(channelContent).text();

                    $("#modalChannelContent").html(channelContent);
                    $("#modalChannelName").text(channelName);

                    $("#channelModal").removeClass("hidden");

                    $("#closeModal").off("click").on("click", function () {
                        $("#modalChannelContent").html("");
                        $("#channelModal").addClass("hidden");
                    });

                    $("#channelModal").off("click").on("click", function(e) {
                        if (e.target.id === "channelModal") {
                            $("#channelModal").addClass("hidden");
                        }
                    });
                },
                error: function() {
                    Swal.fire('خطأ!', 'حدث خطأ في جلب البيانات.', 'error');
                }
            });

            
            });
          },
        });
      },
    });
  };
};

const switchTab = (targetId, currentTab) => {
  const matchDetailView = document.getElementById("match-detail-view");
  if (matchDetailView) matchDetailView.classList.add("hidden");

  contentSections.forEach((section) => {
    section.classList.remove("active");
  });

  currentView = "home";

  if (detailView) detailView.style.display = "none";
  if (tabContentViews) tabContentViews.style.display = "block";
  if (bottomNav) bottomNav.classList.remove("hidden");
  if (adBanner) adBanner.classList.remove("hidden");

  tabs.forEach((tab) => tab.classList.remove("active-tab"));
  if (currentTab) currentTab.classList.add("active-tab");

  if (headerTitle) headerTitle.textContent = getHeaderTitle(targetId);
  if (backButton) backButton.classList.add("hidden");

  if (currentTab && currentTab.dataset.file) {
    loadContent(targetId, currentTab.dataset.file).then(() => {
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        const mainContent = document.querySelector("main");
        if (mainContent) mainContent.scrollTo(0, 0);

        if (targetId === "home-content") {
          attachNewsCardListeners();
        }

        setTimeout(() => {
          targetSection.classList.add("active");
        }, 10);
      }
    });
  } else {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add("active");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  tabs = document.querySelectorAll(".tab-button");
  tabContentViews = document.getElementById("tab-content-views");
  contentSections = document.querySelectorAll(".content-section");
  detailView = document.getElementById("detail-view");
  detailTitle = document.getElementById("detail-title");
  detailImage = document.getElementById("detail-image");
  detailText = document.getElementById("detail-text");
  const appContainer = document.querySelector(".app-container");
  backButton = document.getElementById("back-button");
  headerTitle = document.getElementById("header-title");
  bottomNav = document.querySelector(".bottom-nav");
  adBanner = document.querySelector(".ad-banner");

  function adjustHeight() {
    const totalFixedBottomHeight = 64 + 50;
    const viewportHeight = window.innerHeight;

    if (appContainer) appContainer.style.minHeight = `${viewportHeight}px`;

    const mainContent = document.querySelector("main");
    if (mainContent)
      mainContent.style.paddingBottom = `${totalFixedBottomHeight + 16}px`;
  }

  adjustHeight();
  window.addEventListener("resize", adjustHeight);

  const initialTab = document.querySelector(".tab-button.active-tab");
  if (initialTab) {
    switchTab(initialTab.dataset.target, initialTab);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      switchTab(targetId, tab);
    });
  });

  if (backButton) {
    backButton.addEventListener("click", () => {
      if (currentView === "home") {
        const matchDetailView = document.getElementById("match-detail-view");
        matchDetailView.classList.add("hidden");

        const iframe = document.getElementById("MatchData");
        iframe.src = "";

        setTimeout(() => {
            iframe.src = ""; 
        }, 50);

        switchTab("scores-content", document.getElementById("tab-scores"));
        if (bottomNav) bottomNav.classList.remove("hidden");
        if (adBanner) adBanner.classList.remove("hidden");
      } else if (currentView === "detail") {
        const detailView = document.getElementById("detail-view");
        detailView.classList.add("hidden");

        switchTab("home-content", document.getElementById("tab-home"));
        if (bottomNav) bottomNav.classList.remove("hidden");
        if (adBanner) adBanner.classList.remove("hidden");
      }
    });
  }
});

function SetFrame(id){
    $('#console').html('<iframe src="https://daddyhd.com/watch.php?id=91"></iframe>')
	setTimeout(() => {
		alert(id)
			//$('#console').html('')
    }, 3000);
	
};