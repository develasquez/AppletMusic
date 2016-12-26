 var apiKey = 'AIzaSyAucyHu26je9-g2tW-7F-sQdfKX55xtl8c';
 var currentPlayer = {};
 var currentResults = [];
 var currentOptionPressed = {};
 var selectedlista = {};
 var listas = [];

 function download(name, data) {
   var downObj = document.createElement("a");
   downObj.setAttribute("href", data);
   downObj.setAttribute("download", name + ".mp3");
   downObj.style.display = "none";
   document.body.appendChild(downObj);
   downObj.click();
   document.body.removeChild(downObj);
 }

 function init() {

   try {
     var sdPath = 'Music';
     gapi.client.setApiKey(apiKey);
     gapi.client.load('youtube', 'v3', function(a, b, c) {
         currentPlayer = localStorage.getItem("currentPlayer");
         if (currentPlayer) {
           $(".tituloCancion").text(currentPlayer.snippet.title);
           $(".caratula, .caratulaReproduciendo").attr("src", currentPlayer.snippet.thumbnails.high.url);
           setListItems(localStorage.getItem("resultsList"), function() {
             if ($('#info li').length < 20) {
               buscarVideos(nextPageToken);
             } else {
               monomer.hideLoading();
               localStorage.setItem("resultsList", currentResults);
             }
           });
         }
       })
       //downloader.init({folder: sdPath});
   } catch (ex) {
     console.log(ex);
   }
 }
 audio = {
   src: '',
   evalPlugin: function() {
     return false;
     if (window.plugins && window.plugins.NativeAudio) {
       return true;
     } else {
       return false;
     }
   },
   load: function(url, _fun) {
     if (audio.evalPlugin()) {
       window.plugins.NativeAudio.preloadComplex('player', url, 1, 1, 0, _fun, function(msg) {
         console.log('error: ' + msg);
       });
     } else {
       player = $("#player")[0];
       player.src = url
       player.load();
       _fun();
     }
   },
   play: function(url, _fun) {
     if (!url && !_fun) {
       if (audio.evalPlugin()) {
         window.plugins.NativeAudio.play('click');
       } else {
         player = $("#player")[0];
         player.play()
       }
       return;
     }
     audio.load(url, function() {
       audio.src = url;
       if (audio.evalPlugin()) {
         window.plugins.NativeAudio.play('click', function() {}, function() {}, function() {
           _fun("#player")
         });
       } else {
         player = $("#player")[0];
         $("#player").unbind('ended');
         $("#player").on('ended', function(element) {
           _fun("#player")
         });
         player.play();
       }
     })
   },
   pause: function() {
     if (audio.evalPlugin()) {
       window.plugins.NativeAudio.play('click');
     } else {
       player = $("#player")[0];
       player.pause()
     }
   }
 }

 document.addEventListener('deviceready', function() {
   navigator.splashscreen.hide();
   Ads.initAds();
   Ads.android.banner = 'ca-app-pub-7212681562680695/3725543565';
   Ads.android.interstitial = 'ca-app-pub-7212681562680695/4584997965';
   Ads.ios.banner = 'ca-app-pub-7212681562680695/3725543565';
   Ads.ios.interstitial = 'ca-app-pub-7212681562680695/4584997965';
   Ads.startBannerAds();
   Ads.showBannerAds();
 }, false);
 $(function() {

   /*document.addEventListener('DOWNLOADER_downloadSuccess', function(event){
     monomer.toast("Descarga Finalizada");
   });
   document.addEventListener('DOWNLOADER_downloadError', function(event){
     monomer.toast("Error en la Descarga");
   });*/

   monomer.pageShow('#busqueda');
   $("#txtBuscar").on("keypress", function(evt) {
     if (evt.charCode == 13) {
       $("#btnBuscar").click();
     }
   });
   getListas();
   $(".content").on("scroll", function(a, b) {
     if ((a.currentTarget.scrollHeight - $(".content").height()) == a.currentTarget.scrollTop) {
       buscarVideos(nextPageToken);
     }
   });
   $(".dvYoutuve").on("click", function() {
     var element = $("#player").data("data");

     audio.pause();


     iconPause();
     window.open("https://www.youtube.com/watch?v=" + element.id, '_blank', 'location=no');
   })
   $(".dvPrevia").on("click", function() {
     var element = $("#player").data("data");
     $("#" + element.id).prev().find("h3").click();
   })
   $(".play").on("click", function() {
     tooglePlay();
   });
   $(".dvProxima").on("click", function() {
     var element = $("#player").data("data");
     $("#" + element.id).next().find("h3").click();
   })
   $(".dvDownload").on("click", function() {
     monomer.toast("Descarga Iniciada");
     downloadMp3(audio.src, $(".tituloCancion").text())
   })
   $(".dvYoutuveOp").on("click", function() {


     audio.pause();

     iconPause();
     window.open("https://www.youtube.com/watch?v=" + currentOptionPressed.id.videoId, '_blank', 'location=no');
   })
   $(".dvDownloadOp").on("click", function() {
     monomer.toast("Descarga Iniciada");
     getUrl(currentOptionPressed, function(url, item) {

       downloadMp3(url, item.snippet.title)
     })
   })

   $(".dvToListOp").on("click", function() {

     mostarListas();
   });

   $("#txtBuscar").on("drop", function drop(ev) {
     ev.preventDefault();
     
     var data = ev.dataTransfer.getData("text");
     $.get(data, function(html) {
       var q = $(html).find(".primary-title").text() + " " + $(html).find(".secondary-title").text();
       $("#txtBuscar").val(q);
       buscarVideos();
     })
   })
 });
 var tooglePlay = function() {
   if ($(".play").hasClass("icon-play")) {
     $(".play").removeClass("icon-play");
     $(".play").addClass("icon-pause");

     audio.play();
     if (audio.src == "") {
       playSong(currentPlayer);
     }


   } else {
     $(".play").removeClass("icon-pause");
     $(".play").addClass("icon-play");

     audio.pause();

   }


 };
 var iconPlay = function() {
   $(".play").removeClass("icon-play");
   $(".play").addClass("icon-pause");
 };
 var iconPause = function() {
   $(".play").removeClass("icon-pause");
   $(".play").addClass("icon-play");
 };
 var nextPageToken = '';
 var listItem = function(data) {
   return [
     '<li>',
     '<div>',
     '<div class="test_box fab z-d1">',
     '<img src="' + data.snippet.thumbnails.high.url + '" alt="' + data.snippet.title + '"> ',
     '</div>',
     '</div>',
     '<div>',
     '<div>',
     '<h3>' + data.snippet.title + '</h3>',
     '</div>',
     '<span class="expand-config button-right icon-ellipsis-v icon-1x icon-black trackOptions" target=".configMenu">',
     '</span>',
     '</div>',
     '</li>',
   ].join("\n");
 };

 var b0I = {
   C: function(I, B) {
     return I % B;
   },
   E: function(I, B) {
     return I == B;
   },
   G: function(I, B) {
     return I < B;
   },
   K: function(I, B) {
     return I - B;
   },
   O: function(I, B) {
     return I % B;
   },
   V: function(I, B, P) {
     return I * B * P;
   },
   Z: function(I, B) {
     return I < B;
   },
   B3: function(I, B) {
     return I * B;
   },
   I3: function(I, B) {
     return I in B;
   },
   R3: function(I, B) {
     return I * B;
   },
   v3: function(I, B) {
     return I * B;
   }
 };

 var _sig = function(H) {
   var U = "R3",
     m3 = "round",
     e3 = "B3",
     D3 = "v3",
     N3 = "I3",
     g3 = "V",
     K3 = "toLowerCase",
     n3 = "substr",
     z3 = "Z",
     d3 = "C",
     P3 = "O",
     x3 = ['a', 'c', 'e', 'i', 'h', 'm', 'l', 'o', 'n', 's', 't', '.'],
     G3 = [6, 7, 1, 0, 10, 3, 7, 8, 11, 4, 7, 9, 10, 8, 0, 5, 2],
     M = ['a', 'c', 'b', 'e', 'd', 'g', 'm', '-', 's', 'o', '.', 'p', '3', 'r', 'u', 't', 'v', 'y', 'n'],
     X = [
       [17, 9, 14, 15, 14, 2, 3, 7, 6, 11, 12, 10, 9, 13, 5],
       [11, 6, 4, 1, 9, 18, 16, 10, 0, 11, 11, 8, 11, 9, 15, 10, 1, 9, 6]
     ],
     A = {
       "a": 870,
       "b": 906,
       "c": 167,
       "d": 119,
       "e": 130,
       "f": 899,
       "g": 248,
       "h": 123,
       "i": 627,
       "j": 706,
       "k": 694,
       "l": 421,
       "m": 214,
       "n": 561,
       "o": 819,
       "p": 925,
       "q": 857,
       "r": 539,
       "s": 898,
       "t": 866,
       "u": 433,
       "v": 299,
       "w": 137,
       "x": 285,
       "y": 613,
       "z": 635,
       "_": 638,
       "&": 639,
       "-": 880,
       "/": 687,
       "=": 721
     },
     r3 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
   var gs = function(I, B) {
     var P = "D",
       J = "";
     for (var R = 0; b0I[P](R, I.length); R++) {
       J += B[I[R]];
     };
     return J;
   };
   var ew = function(I, B) {
     var P = "K",
       J = "indexOf";
     return I[J](B, b0I[P](I.length, B.length)) !== -1;
   };
   var gh = function() {
     var I = gs(G3, x3);
     return eval(I);
   };
   var fn = function(I, B) {
     var P = "E",
       J = "G";
     for (var R = 0; b0I[J](R, I.length); R++) {
       if (b0I[P](I[R], B)) return R;
     }
     return -1;
   };
   var L = [1.23413, 1.51214, 1.9141741, 1.5123114, 1.51214, 1.2651],
     F = 1;
   try {
     F = L[b0I[P3](1, 2)];
     var W = gh(),
       S = gs(X[0], M),
       T = gs(X[1], M);
     if (ew(W, S) || ew(W, T)) {
       F = L[1];
     } else {
       F = L[b0I[d3](5, 3)];
     }
   } catch (I) {};
   var N = 3219;
   for (var Y = 0; b0I[z3](Y, H.length); Y++) {
     var Q = H[n3](Y, 1)[K3]();
     if (fn(r3, Q) > -1) {
       N = N + (b0I[g3](parseInt(Q), 121, F));
     } else {
       if (b0I[N3](Q, A)) {
         N = N + (b0I[D3](A[Q], F));
       }
     }
     N = b0I[e3](N, 0.1);
   }
   N = Math[m3](b0I[U](N, 1000));
   return N;
 };


 var sig = function(a) {
   if ("function" == typeof _sig) {
     var b = "X";
     try {
       b = _sig(a);
     } catch (c) {}
     if ("X" != b) return b;
   }
   return "-1";
 };
 var sig_url = function(a) {
   var b = sig(a);
   return a + "&s=" + escape(b);
 };

 var getTime = function() {
   return new Date().getTime();
 };

 var url1 = function(VideoId) {

   return sig_url("http://www.youtube-mp3.org/a/pushItem/?item=https%3A//www.youtube.com/watch%3Fv%3D" + VideoId + "&el=na&bf=false&r=" + getTime());
 };
 var url2 = function(VideoId) {
   return sig_url('http://www.youtube-mp3.org/a/itemInfo/?video_id=' + VideoId + '&ac=www&t=grp&r=' + getTime());
 };


 var url3 = function(videoId, ts_create, h2, r) {
   return sig_url('http://www.youtube-mp3.org/get?video_id=' + videoId + '&ts_create=' + ts_create + '&r=' + r + '&h2=' + h2);
 };

 function downloadMp3(url, fileName) {
   
   //document.location.href = url;
   download(fileName,url);
 }

 var resp = {};

 function getVideoDetails(item, _fun) {
   var videoId = item.id.videoId;
   gapi.client.youtube.videos.list({
       id: videoId,
       part: 'contentDetails'
     })
     .execute(function(response) {
       duration = response.items[0].contentDetails.duration;
       time = duration
         .replace("PT", (duration.indexOf("H") > -1 ? "" : ":"))
         .replace("H", ":")
         .replace("M", ":")
         .replace("S", "")
         .split(":");

       hora = parseInt(time[0]) || 0;

       minuto = parseInt(time[1]) || 0;

       segundo = parseInt(time[2]) || 0;



       if (!(hora > 0 || minuto > 20)) {

         _fun(item, response, time)
       } else {
         _fun(null, null, null);
       }
     })
 }


 function playSong(item) {

   getUrl(item, function(url, item) {
     localStorage.setItem("currentPlayer", item);
     $("#player").data("data", JSON.stringify({
       id: item.id.videoId
     }));
     audio.play(url, function(player) {
       var element = $(player).data("data");
       $("#" + element.id).next().find("h3").click();
     });

     iconPlay();
     monomer.toast(item.snippet.title);
     $(".tituloCancion").text(item.snippet.title);
     $(".caratula, .caratulaReproduciendo").attr("src", item.snippet.thumbnails.high.url);
   });
 }

 function getUrl(item, _fun) {

   $.get(url1(item.id.videoId), function(response) {
     $.get(url2(response), function(response) {
       response = eval(response);
       _fun(url3(item.id.videoId, response.ts_create, response.h2, response.r), item);
     });
   });
 }


 var totalItemsToList = 0;
 var currentItemProcessing = 0;


 function getListas() {
   service.getLists(function(items) {
     listas = items;
     localStorage.setItem("listas", listas);
     $.each(listas, function(index, item) {
       if (!localStorage.getItem(item.nombreLista)) {
         localStorage.setItem(item.nombreLista, JSON.parse(item.items));
       }
     })
     actualizarListas();
   });
 }

 function setListItems(items, _fun) {
   currentItemProcessing = 0;
   totalItemsToList = items.length;
   for (var item in items) {
     item = items[item];
     if (typeof(item) != "function") {
       currentResults.push(item)
       if (item.id.videoId) {
         getVideoDetails(item, function(item, response, time) {

           currentItemProcessing++;
           if (item) {
             var newVideo = $(listItem(item));
             $(newVideo).attr("id", item.id.videoId).data("data", JSON.stringify(item))
             $(newVideo).delegate("img, h3", "click", function(a, b, c) {
               playSong($(a.originalEvent.currentTarget).data("data"));
             });
             $(newVideo).delegate(".trackOptions", "click", function(a, b, c) {
               currentOptionPressed = $(a.originalEvent.currentTarget).data("data");
             });
             $('#info').append(newVideo);
           }
           if (currentItemProcessing == totalItemsToList) {
             monomer.__init();
             monomer.__setAspect();
             _fun();

           }
         })
       } else if (item.id.channelId || item.id.playlistId) {
         currentItemProcessing++;
       }
     };
   }
 }

 function sugerencias(q, _fun) {
   var request = gapi.client.youtube.search.list({
     q: q,
     part: 'snippet',
     type: 'video',
     maxResults: 20
   });
   request.execute(function(response) {
     _fun();
   })
 }

 function buscarVideos(PageToken) {
   if ($("#txtBuscar").val() == "") {
     return false;
   }

   if (!PageToken) {
     PageToken = '';
     $('#info').html("");
     currentResults = [];
     totalItemsToList = 0;
     monomer.showLoading();
   }
   var q = $('#txtBuscar').val();
   var request = gapi.client.youtube.search.list({
     q: q,
     part: 'snippet',
     type: 'video',
     maxResults: 20,
     pageToken: PageToken
   });

   request.execute(function(response) {
     try {
       nextPageToken = response.nextPageToken;
       setListItems(response.result.items, function() {
         if ($('#info li').length < 20) {
           buscarVideos(nextPageToken);
         } else {
           monomer.hideLoading();
           localStorage.setItem("resultsList", currentResults);
         }
       });

     } catch (ex) {

     }

   });
 }

 function mostarListas() {

   monomer.showDialog("#popupListas");
 }

 function nuevaLista() {
   var nombre = $("#txtNombreNuevaLista").val();
   if (nombre.length > 20) {
     monomer.toast("Máximo 20 letras");
     return false;
   }
   var newList = {
     _id: "",
     nombreLista: nombre,
     traks: 0
   };

   if (listas.where({
       nombreLista: nombre
     }).length == 0) {
     listas.push(newList);
     localStorage.setItem("listas", listas);
     localStorage.setItem(nombre, []);
     if (currentOptionPressed) {
       service.setNewList({
         users: "57d3686603beaf023a393ccf",
         nombreLista: nombre,
         traks: 0,
         items: ""
       }, function(lista) {
         
         agregarALista(nombre, currentItemProcessing, lista._id)
       });
     }


     actualizarListas();
   }

   $("#txtNombreNuevaLista").val("");
 };

 function agregarALista(nombre, item, lista) {
   var theList = localStorage.getItem(nombre);
   if (theList.where({
       "id.videoId": currentOptionPressed.id.videoId
     }).length == 0) {
     theList.push(currentOptionPressed);
     localStorage.setItem(nombre, theList);
     service.updateList({
       _id: lista,
       traks: theList.length,
       items: JSON.stringify(theList)
     }, function() {
       getListas();
     });
     monomer.toast("Añadido a lista " + nombre)
   } else {
     monomer.toast("La canción ya está en la lista " + nombre)
   }


 };

 function actualizarListasPopup() {
   try {
     $("#ListasReprododuccionLst").html("");

     for (var i = 0; i < listas.length; i++) {

       var newLi = $("<li>").text(listas[i].nombreLista)
         .attr("id", listas[i]._id)
         .on("click", function(evt) {
           var nombre = $(this).text();
           var _id = $(this).attr("id");
           agregarALista(nombre, currentItemProcessing, _id);
           monomer.hideDialog();
         })
       $("#ListasReprododuccionLst").append(newLi);
     }
     monomer.refresh();
   } catch (ex) {}
 }

 function actualizarListas() {

   actualizarListasPage();
   actualizarListasPopup();

 }

 function actualizarListasPage() {
   //Actualiza en pagina
   $("#dvListas").html("");
   for (var i = 0; i < listas.length; i++) {
     try {
       var thelist = localStorage.getItem(listas[i].nombreLista);
       var imagenes = [];
       for (var j = 0; j < thelist.length; j++) {
         if (j < 4) {
           imagenes.push(thelist[j].snippet.thumbnails.high.url);
         }
       }
       var newListItem = $(htmlLista(listas[i].nombreLista, imagenes))
         .data("data", JSON.stringify(listas[i]))
         .on("click", function() {
           selectedlista = $(this).data("data");
           $('#info').html("");
           currentResults = localStorage.getItem(selectedlista.nombreLista);
           localStorage.setItem("resultsList", currentResults);
           setListItems(currentResults, function() {
             monomer.pageShow('#busqueda');
           })
         })
       $("#dvListas").append(newListItem);
     } catch (ex) {

     }
   }
 }
 htmlLista = function(nombre, imagenes) {

   var imagenesHtml = '<img src="img/yom.png" alt="" class="aspect_1_1">';
   var insertedImg = 0;
   for (var i = 0; i < imagenes.length; i++) {
     if (i == 0) {
       imagenesHtml = '';
     };
     if (i < 4) {
       imagenesHtml += '<img src="' + imagenes[i] + '" alt="" class="CLASS">';
       insertedImg++;
     }

   };
   var clase = "aspect_1_1";
   switch (insertedImg) {
     case 2:
       {
         clase = "listaImgX2";
       }
       break;
     case 3:
       {
         //imagenesHtml.splice(2);
         clase = "listaImgX2";
       }
       break;
     case 4:
       {
         clase = "listaImgX4";
       }
       break;
   }
   imagenesHtml = imagenesHtml.replace(/CLASS/g, clase);
   return [
     '<div class="card card_35 background_control">',
     '<div class="media grey aspect_1_1">',
     imagenesHtml,
     '</div>',
     '<div class="text">',
     '<h3 class="nombreLista">' + nombre + '</h3>',
     '</div>',
     '</div>'
   ].join("\n");
 }