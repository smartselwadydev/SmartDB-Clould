
// يفضل تشفير هذا الملف ورفعه علي السيرفر .. والإحتفاظ بنسخة غير مشفرة علي الجهاز
// https://codebeautify.org/javascript-obfuscator


$(document).ready(function(){

    /*
    // لو عايز الكود يشتغل علي سيرفرك بس .. علشان محدش يسرقه
    if((window.location.host).includes("YOUR_HOST_NAME.com") == false){  // EX : sportmatchs.com
        window.location.href = "YOUR_URL_HERE";
    }
    */

    server_buts_click_fun();
    top_buts_click_fun();

    var params={};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(str,key,value){params[key]=value;});
    var match_id = params["match_id"];

    $("body").attr("match_id",match_id);

    if(!match_id){
        $("#preloader").addClass("hidden");
        $("#main_area_1,#no_server_found_div").removeClass("hidden");
    }

    if(match_id){ get_server_json_fun(); }

});

//===========================  get_server_json_fun  ============================

function get_server_json_fun(){

    $.ajax({url:"https://mydb.sportmatchs.com/channel/channel_from_wedsite.json",timeout:5000,dataType:"json",cache:false,
        success:function(data){
            localStorage.setItem("server_json_arr",JSON.stringify(data));
            localStorage.setItem("lastget-server_json_arr",Math.trunc(new Date().getTime()/1000));
            after_get_server_json_fun();
        },
        error:function(){
            after_get_server_json_fun();
        }
    });

}

//========================  after_get_server_json_fun  =========================

function after_get_server_json_fun(){

    var server_json_arr = JSON.parse(localStorage.getItem("server_json_arr"));
    var match_id = $("body").attr("match_id");
    $(".server_but").attr("found","no");

    if(server_json_arr[match_id]){
        for(var i = 0; i < server_json_arr[match_id].length; i++){
            var url = server_json_arr[match_id][i].url;
            var player_type = server_json_arr[match_id][i].player_type;
            if(!$(".server_but[url='"+url+"']").length){
                $("#server_area").append('<button class="server_but" url="'+url+'" player_type="'+player_type+'" ><i class="fa fa-television"></i><p></p></button>');
            }
            $(".server_but[url='"+url+"']").attr("found","yes");
        }
    
        $(".server_but[found='no']").detach();
        $(".server_but p").each(function(eq){$(this).text("سيرفر "+(eq+1));});
        $("#preloader").addClass("hidden");$("#main_area_1,#server_area").removeClass("hidden");
    
    }

    if(!server_json_arr[match_id] && !$(".server_but").length){
        $("#preloader").addClass("hidden");$("#main_area_1,#no_server_found_div").removeClass("hidden");
    }

}

//===========================  server_buts_click_fun  ==========================

function server_buts_click_fun(){

    $(document).on("click",".server_but",function(){
    
        $(".server_but.active").removeClass("active");
        $(this).addClass("active");
    
        localStorage.setItem("scroll_position",($(document).scrollTop()));
    
        $("#main_area_1").addClass("hidden");
        $("#main_area_2").removeClass("hidden");
        $("#main_area_2 #video_area *").detach();
    
        var video_url = $(this).attr("url");
        var player_type = $(this).attr("player_type");
        var poster = "https://3.bp.blogspot.com/-bAWqvsMrURY/W_N7Tplqp6I/AAAAAAAACXE/tdXNUQFsDskuvKxq_uvW90alU2spwijNACLcBGAs/s600/3.jpg";
    
        if(player_type == "m3u8"){
            new Clappr.Player({ source:video_url,parentId:"#video_area",poster:{url:poster,showOnVideoEnd:false},playback:{playInline:true} });
        }
        else{
            $("#video_area").append('<iframe id="video_iframe" src="'+video_url+'" controls autoplay playsinline allowfullscreen="true" webkitallowfullscreen="true" ></iframe>');
        }
    
    });

}

//============================  top_buts_click_fun  ============================

function top_buts_click_fun(){

    $(document).on("click","#refresh_all_server_but",function(){
    
        $("#preloader").removeClass("hidden");
        $("#main_area_1,#server_area,#no_server_found_div").addClass("hidden");
        setTimeout(function(){
            $(".server_but.active").removeClass("active");
            get_server_json_fun();
        },500);
    
    });

    $(document).on("click","#refresh_but",function(){ $(".server_but.active").click(); });

    $(document).on("click","#back_but",function(){
    
        $("#main_area_1").removeClass("hidden");
        $("#main_area_2").addClass("hidden");
        $("#main_area_2 #video_area *").detach();
        $(document).scrollTop(localStorage.getItem("scroll_position"));
        
        var lastget_server_json_arr = (Math.trunc(new Date().getTime()/1000)-localStorage.getItem("lastget-server_json_arr"))/60;
        if(lastget_server_json_arr > 5){ get_server_json_fun(); }    /* meaning : when click back_but if last get servers > 5 minutes : do auto refresh to servers */
    
    });

}




