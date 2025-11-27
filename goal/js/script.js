// $(document).ready(function() {
    
//     $.ajax({
//     url: 'https://smartdb.smartselwady.org/YallaVamosNews_View',
//     type: 'GET',
//     dataType: 'json',
//     success: function(res) {
//         var data = res.results[0].fetchDB;
//         var fetchDB = JSON.parse(data);
//         // console.log(fetchDB)
        
//         fetchDB.map(item=>{
//             console.log(item);
//             $("#home-content").append(`
//                 <div class="news-card bg-white rounded-xl shadow-lg p-4 transition duration-300 hover:shadow-xl border-r-4 border-red-500 flex items-center cursor-pointer" 
//                 data-title="${item.title}" 
//                 data-image="${item.imgurl}"
//                 data-category="كرة القدم"
//                 data-time="منذ 3 ساعات"
//                 data-details="${item.title}">
//                 <img src="${item.imgurl}" alt="Football Goal" class="news-thumbnail">
//                 <div class="flex-grow text-right">
//                     <h3 class="text-lg font-bold mb-1">${item.title}</h3>
//                     <p class="text-sm text-gray-600 mb-2 line-clamp-2">${item.title}</p>
//                     <div class="flex justify-between items-center text-xs text-gray-400">
//                         <span>كرة القدم</span>
//                         <span>منذ 3 ساعات</span>
//                     </div>
//                 </div>
//             </div>
//                 `);
//         })

//     },
//     error: function(xhr, status, error) {
//         console.log("❌ Error:", error);
//     }
// });

// });
