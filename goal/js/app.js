// const matchData = [

//     { date: 'yesterday', teamA: 'الريال', teamB: 'برشلونة', scoreA: 3, scoreB: 1, status: 'انتهت', statusColor: 'gray-500', isLive: false, league: 'دوري أبطال أوروبا' },
//     { date: 'yesterday', teamA: 'فريق النجوم', teamB: 'العمالقة', scoreA: 95, scoreB: 98, status: 'انتهت', statusColor: 'gray-500', isLive: false, league: 'دوري كرة السلة' },


//     { date: 'today', teamA: 'الأهلي', teamB: 'الزمالك', scoreA: 1, scoreB: 1, status: 'جاري اللعب (د: 75)', statusColor: 'red-600', isLive: true, league: 'الدوري المحلي' },
//     { date: 'today', teamA: 'ليفربول', teamB: 'مانشستر سيتي', scoreA: 0, scoreB: 0, status: 'تبدأ 20:00', statusColor: 'blue-500', isLive: false, league: 'الدوري الإنجليزي' },
//     { date: 'today', teamA: 'بايرن ميونخ', teamB: 'دورتموند', scoreA: 2, scoreB: 0, status: 'جاري اللعب (الشوط 1)', statusColor: 'red-600', isLive: true, league: 'الدوري الألماني' },


//     { date: 'tomorrow', teamA: 'إيطاليا', teamB: 'إسبانيا', scoreA: null, scoreB: null, status: 'غداً 19:45', statusColor: 'green-600', isLive: false, league: 'تصفيات اليورو' },
//     { date: 'tomorrow', teamA: 'الهلال', teamB: 'النصر', scoreA: null, scoreB: null, status: 'غداً 21:00', statusColor: 'green-600', isLive: false, league: 'الدوري السعودي' },
// ];



let currentView = 'home';
let detailView, tabContentViews, detailTitle, detailImage, detailCategory, detailTime, detailText;
let bottomNav, adBanner, headerTitle, backButton, contentSections, tabs;


const getHeaderTitle = (targetId) => {
    switch(targetId) {
        case 'home-content':
            return 'اخر الاخبار';
        case 'scores-content':
            return 'جدول المباريات';
        case 'teams-content':
            return 'جدول الترتيب';
        case 'settings-content':
            return 'الإعدادات';
        default:
            return 'يلا جول';
    }
};


const createMatchCard = (match) => {
    const isLive = match.isLive;
    // const isLive = true;
    const centerTxt = isLive ? '<span class="live-text text-red-600 font-bold">جارية الان</span>' : '-';

    return `
        <div onclick="localStorage.setItem('active_match', ${match.id}); app.views.main.router.navigate({path:'/view_match'});" 
            class="match-card bg-white rounded-xl shadow-md p-4 transition duration-300 hover:shadow-lg border-r-4 ${isLive ? 'border-red-500' : 'border-gray-300'} space-y-2">
            
            <div class="text-xs font-medium text-gray-500 text-right border-b border-gray-100 pb-2 mb-2" style="display: flex;
    align-items: center;
    gap: 5px;">
                <img src="https://imagecache.365scores.com/image/upload/f_png,w_20,h_20,c_limit,q_auto:eco,dpr_3,d_Countries:Round:122.png/v2/Competitions/light/
${match.leagueId}" style="width: 25px;height: 25px;" /> <span style="font-size:16px;font-weight:bold;">${match.league}</span>
            </div>

            <div class="flex items-center justify-between">
                
                <div class="flex flex-col items-center w-1/3 text-right">
                    <img src="https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_Competitors:default1.png/Competitors/${match.homeId}" alt="${match.teamA}">
                    <span class="text-sm font-semibold text-gray-800 mt-1">${match.teamA}</span>
                </div>

                <div class="flex flex-col items-center w-1/3 text-center">
                    
                    <span class="sfont block mt-1">${match.status}</span>
                    <div class="text-lg font-bold text-gray-400 mt-1">${match.scoreA !== null ? match.scoreA : '-'} : ${match.scoreB !== null ? match.scoreB : '-'}</div>
                </div>

                <div class="flex flex-col items-center w-1/3 text-left">
                    <img src="https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_Competitors:default1.png/Competitors/${match.awayId}" alt="${match.teamB}">
                    <span class="text-sm font-semibold text-gray-800 mt-1">${match.teamB}</span>
                </div>

            </div>
        </div>
    `;
};


const renderMatches = (dateFilter) => {
    const container = $('#match-list-container');
    container.html('');

    $.ajax({
        url: 'https://smartdb.smartselwady.org/LiveStreamMatchsIDs_View',
        method: 'GET',
        dataType: 'json',
        success: function(res) {
            const fetchDB = JSON.parse(res.results[0].fetchDB);
            console.log(fetchDB);

            let matchIDIndex;
            if (dateFilter === 'yesterday') matchIDIndex = 1;
            else if (dateFilter === 'today') matchIDIndex = 0;
            else if (dateFilter === 'tomorrow') matchIDIndex = 2;

            const req_url = `https://webws.365scores.com/web/games/?langId=27&timezoneName=Asia/Riyadh&userCountryId=-1&appTypeId=5&games=${fetchDB[matchIDIndex].id}&startDate=23/11/1999&endDate=23/11/2030`;

            $.ajax({
                url: req_url,
                method: 'POST',
                dataType: 'json',
                success: function(result) {
                    console.log(result)
                    if (result.ttl === "5" || !result.games || result.games.length === 0) {
                        container.html(`
                            <div class="bg-gray-50 p-6 rounded-xl text-center text-gray-600 shadow-inner mt-4">
                                <p class="text-lg font-semibold">لا توجد مباريات مقررة ${dateFilter === 'yesterday' ? 'بالأمس' : dateFilter === 'today' ? 'اليوم' : 'غداً'}.</p>
                            </div>
                        `);
                        return;
                    }

                  result.games.sort((a, b) => {
                        const getOrder = (game) => {
                            const status = game.statusText.toLowerCase();
                            if (status.includes('جاري اللعب') || status.includes('الشوط')) return 0;
                            if (status.includes('لم تبدأ')) return 1;
                            if (status.includes('انتهت')) return 2;
                            return 3;
                        };

                        return getOrder(a) - getOrder(b);
                    });

                    

                    result.games.forEach(game => {
                        console.log(game);
                        const isLive = game.statusGroup === '4' || game.statusGroup === '2';
                        // console.log(isLive)
                        // console.log(isLive ? `جاري اللعب (${game.statusText})` : game.statusText)
                        // console.log(game.statusText)
                        const match = {
                            id: game.id,
                            teamA: game.homeCompetitor.name,
                            homeId: game.homeCompetitor.id,
                            teamB: game.awayCompetitor.name,
                            awayId: game.awayCompetitor.id,
                            scoreA: game.homeCompetitor.score >= 0 ? game.homeCompetitor.score : null,
                            scoreB: game.awayCompetitor.score >= 0 ? game.awayCompetitor.score : null,
                            status: isLive ? `جاري اللعب (${game.statusText})` : game.statusText,
                            isLive: isLive,
                            league: game.competitionDisplayName,
                            leagueId: game.competitionId
                        };

                        container.append(createMatchCard(match));
                    });

                },
                error: function(xhr, status, error) {
                    container.html('<p class="text-center text-red-500">حدث خطأ في جلب بيانات المباريات.</p>');
                    console.error("Error fetching matches from 365Scores:", error);
                }
            });
        },
        error: function(xhr, status, error) {
            container.html('<p class="text-center text-red-500">فشل في تحميل معرفات المباريات.</p>');
            console.error("Error fetching match IDs:", error);
        }
    });
};




const switchDateTab = (selectedButton) => {

    document.querySelectorAll('#scores-content .date-tab').forEach(btn => {
        btn.classList.remove('bg-cyan-800', 'text-white', 'shadow-md');
        btn.classList.add('text-gray-600', 'hover:bg-white', 'hover:shadow-sm');
    });


    selectedButton.classList.add('bg-cyan-800', 'text-white', 'shadow-md');
    selectedButton.classList.remove('text-gray-600', 'hover:bg-white', 'hover:shadow-sm');
    

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
        

        if (targetId === 'home-content') {
            attachNewsCardListeners();
        } else if (targetId === 'scores-content') {

            attachScoreTabListeners();
        }
    } catch (error) {
        console.error(`Error loading content for ${targetId}:`, error);
        targetSection.innerHTML = '<div class="p-4 text-red-500">فشل في تحميل المحتوى.</div>';
    }
};


// const attachNewsCardListeners = () => {
//     $.ajax({
//         url: 'https://smartdb.smartselwady.org/YallaVamosNews_View',
//         type: 'GET',
//         dataType: 'json',
//         success: function(res) {
//             var data = res.results[0].fetchDB;
//             var fetchDB = JSON.parse(data);

//             const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange'];

//             fetchDB.map((item, index) => {
//                 console.log(item);
//                 let color = colors[index % colors.length];

//                 $("#home-content").append(`
//                     <div class="news-card bg-white rounded-xl shadow-lg p-4 transition duration-300 hover:shadow-xl border-r-4 border-${color}-500 flex items-center cursor-pointer" 
//                         data-title="${item.title}" 
//                         data-image="${item.imgurl}"
//                         data-category="كرة القدم"
//                         data-time="منذ 3 ساعات"
//                         data-details="${item.title}">
//                         <img src="${item.imgurl}" alt="Football Goal" class="news-thumbnail">
//                         <div class="flex-grow text-right">
//                             <h3 class="text-lg font-bold mb-1">${item.title}</h3>
//                             <p class="text-sm text-gray-600 mb-2 line-clamp-2">${item.title}</p>
//                             <div class="flex justify-between items-center text-xs text-gray-400">
//                                 <span>كرة القدم</span>
//                                 <span>منذ 3 ساعات</span>
//                             </div>
//                         </div>
//                     </div>
//                 `);
//             });
//         },
//         error: function(xhr, status, error) {
//             console.log("❌ Error:", error);
//         }
//     });
// };


let fetchDB = [];
const limit = 20;
let start = 0;

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange'];

const attachNewsCardListeners = () => {

     const container = document.getElementById('home-content');
    
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.news-card');
        if (card) {
            showNewsDetail(card); 
        }
    });

    $.ajax({
        url: 'https://smartdb.smartselwady.org/YallaVamosNews_View',
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            fetchDB = JSON.parse(res.results[0].fetchDB);
            console.log(fetchDB);
            loadNextBatch();
        },
        error: function(xhr, status, error) {
            console.log("❌ Error:", error);
        }
    });
};

const loadNextBatch = () => {
    const end = start + limit;
    const batch = fetchDB.slice(start, end);

    batch.forEach((item, index) => {
        let color = colors[(start + index) % colors.length];
        $("#home-content").append(`
            <div class="news-card bg-white rounded-xl shadow-lg p-4 transition duration-300 hover:shadow-xl border-r-4 border-${color}-500 flex items-center cursor-pointer" 
                data-title="${item.title}" 
                data-image="${item.imgurl}"
                data-category="كرة القدم"
                data-time="منذ 3 ساعات"
                data-details="${item.title}">
                <img src="${item.imgurl}" alt="Football Goal" class="news-thumbnail">
                <div class="flex-grow text-right">
                    <h3 class="text-lg font-bold mb-1">${item.title}</h3>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">${item.title}</p>
                </div>
            </div>
        `);
    });

    start += limit;
};

$(window).scroll(function() {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 200) {
        if (start < fetchDB.length) {
            loadNextBatch();
        }
    }
});


// const attachScoreTabListeners = () => {
//     const dateTabs = document.querySelectorAll('#scores-content .date-tab');
    

//     const todayButton = document.querySelector('#scores-content .date-tab[data-date="today"]');

//     if (todayButton) {

//         switchDateTab(todayButton);
//     } else {

//         renderMatches('today'); 
//     }


//     dateTabs.forEach(tab => {
//         tab.addEventListener('click', (e) => {
//             switchDateTab(e.currentTarget);
//         });
//     });
// };

const attachScoreTabListeners = () => {
    const dateTabs = document.querySelectorAll('#scores-content .date-tab');

    // افتراضيًا نعرض "اليوم"
    const todayButton = document.querySelector('#scores-content .date-tab[data-date="today"]');
    if (todayButton) switchDateTab(todayButton);
    else renderMatches('today');

    dateTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchDateTab(e.currentTarget);
        });
    });
};


const showNewsDetail = (card) => {
    if (!detailView || !tabContentViews) {
        console.error("View elements not initialized.");
        return;
    }
    
    currentView = 'detail';
    contentSections.forEach(section => section.classList.remove('active'));
    
    if(tabContentViews) tabContentViews.style.display = 'none';
    
    if(detailView) {
        detailView.style.display = 'block';
        detailView.style.opacity = 0;
        detailView.style.transform = 'translateY(10px)';

        if(detailTitle) detailTitle.textContent = card.dataset.title;
        if(detailImage) detailImage.src = card.dataset.image;
        if(detailCategory) detailCategory.textContent = card.dataset.category;
        if(detailTime) detailTime.textContent = card.dataset.time;
        if(detailText) detailText.textContent = card.dataset.details;
    }

    if(bottomNav) bottomNav.classList.add('hidden');
    if(adBanner) adBanner.classList.add('hidden');
    
    if(headerTitle) headerTitle.textContent = 'تفاصيل الخبر';
    if(backButton) backButton.classList.remove('hidden');

    setTimeout(() => {
        if(detailView) {
            detailView.style.opacity = 1;
            detailView.style.transform = 'translateY(0)';
        }
    }, 50);

    const mainContent = document.querySelector('main');
    if(mainContent) mainContent.scrollTo(0, 0);
};


const switchTab = (targetId, currentTab) => {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    currentView = 'home'; 
    
    if (detailView) detailView.style.display = 'none';
    if (tabContentViews) tabContentViews.style.display = 'block';
    if(bottomNav) bottomNav.classList.remove('hidden');
    if(adBanner) adBanner.classList.remove('hidden');

    tabs.forEach(tab => tab.classList.remove('active-tab'));
    if(currentTab) currentTab.classList.add('active-tab');

    if(headerTitle) headerTitle.textContent = getHeaderTitle(targetId);
    if(backButton) backButton.classList.add('hidden');

    if(currentTab && currentTab.dataset.file) {
        loadContent(targetId, currentTab.dataset.file).then(() => {
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const mainContent = document.querySelector('main');
                if(mainContent) mainContent.scrollTo(0, 0); 
    
                setTimeout(() => {
                    targetSection.classList.add('active');
                }, 10); 
            }
        });
    } else {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    tabs = document.querySelectorAll('.tab-button');
    tabContentViews = document.getElementById('tab-content-views');
    contentSections = document.querySelectorAll('.content-section');
    detailView = document.getElementById('detail-view');
    detailTitle = document.getElementById('detail-title');
    detailImage = document.getElementById('detail-image');
    detailCategory = document.getElementById('detail-category');
    detailTime = document.getElementById('detail-time');
    detailText = document.getElementById('detail-text');
    const appContainer = document.querySelector('.app-container');
    backButton = document.getElementById('back-button');
    headerTitle = document.getElementById('header-title');
    bottomNav = document.querySelector('.bottom-nav');
    adBanner = document.querySelector('.ad-banner');
    

    function adjustHeight() {
        const totalFixedBottomHeight = 64 + 50;
        const viewportHeight = window.innerHeight;
        
        if(appContainer) appContainer.style.minHeight = `${viewportHeight}px`;

        const mainContent = document.querySelector('main');
        if(mainContent) mainContent.style.paddingBottom = `${totalFixedBottomHeight + 16}px`; 
    }

    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    
    const initialTab = document.querySelector('.tab-button.active-tab');
    if (initialTab) {
        switchTab(initialTab.dataset.target, initialTab);
    }


    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            switchTab(targetId, tab); 
        });
    });

    if (backButton) {
        backButton.addEventListener('click', () => {
            if (currentView === 'detail') {
                if (detailView) {
                    detailView.style.opacity = 0;
                    detailView.style.transform = 'translateY(10px)';
                }

                setTimeout(() => {
                    switchTab('home-content', document.getElementById('tab-home'));
                }, 300); 
            }
        });
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
});