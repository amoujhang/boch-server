
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request');
var jsonQuery = require('json-query')
var dir = require('node-dir');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
//var dropdowns = require('./data/Dropdowns.json')
var droplists = require('./data/Droplists.json')
var locations = require('./data/Locations.json')
var classes = require('./data/Classes.json')
var lives = require('./data/Lives.json')
var infos = require('./data/Infos.json')
var urls = require('./data/Urls.json')
var ss = require('./data/SlideShow.json')
var success = require('./data/success.json')
var fail = require('./data/fail.json')
var flyput = require('./data/flyPutDataGen.json')
var config = require('./config.js');

var app = express();


var wallUrl = "http://"+config.serverIp+":"+config.port+"/static/wall/";
var flyputUrl = "http://"+config.serverIp+":"+config.port+"/static/flyput/";
var VRUrl = "http://"+config.serverIp+":"+config.port+"/static/VR/"


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/static', express.static(config.staticPath));

var listener = app.listen(config.port, function () {
	console.log("app is running on port " + config.port);
})

function sendJson(Data){
	var clientServerOptions = {
		uri: 'http://13share.me:8100/mqtt',
		body: JSON.stringify(Data),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}
	request(clientServerOptions, function (error, response) {
		console.log(error,response.body);
		return;
	});
}




app.get('/file',function(req, res, next) {

	const directoryPath = path.join(__dirname, 'public/panos');

	dir.files(directoryPath, function(err, files) {
		if (err) throw err;

		res.json(files);

	});


})




app.post('/login',function(req, res, next) {
	var ac = req.body.ac;
	var pw = req.body.pw;
	console.log("login");
	if(ac == "admin" && pw == "1234") {
		res.json({"IsSuccess":true,"Message":""});
	}
	else {
		res.json({"IsSuccess":false,"Message":"帳號密碼有誤"});
	}
})

//270============================================================================

//SS======================================


app.get('/ss',function(req, res, next) {
	console.log("Get Slideshow");
	res.json(ss);  
})


app.post('/ss',function(req, res, next) {
	
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/idle/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success);  
	})

//DP======================================

app.get('/dplists',function(req, res, next) {	
	console.log("Dp query : " +req.query.id+";");
      //  res.json(success);  


//res.json(small);  
res.json(droplists);  

})

function makeFlyput(data){

	var newData = JSON.parse(JSON.stringify(data));

// Change server url
for(var i  = 0 ; i < newData.length ;i++){

	var unwanted = "E:/Downloads/boch-image/";
	newData[i].cover_url = newData[i].cover_url.replace(unwanted,flyputUrl);				

	for(var j  = 0 ; j < newData[i].panorama_list.length ;j++){

		newData[i].panorama_list[j].thumb = flyputUrl + data[i].panorama_list[j].thumb;	
		newData[i].panorama_list[j].path = flyputUrl+   data[i].panorama_list[j].path;	
	}

}

// Add rootObject
var dataJson ={};	
dataJson.locations = newData;

return dataJson;
}

var id0 = 0
var id1 = 0
var id2 = 0
var id3 = 0

app.get('/fly',function(req, res, next) {
	// /loc?id0=0&id1=0&id2=0&id3=0
	//http://localhost:3000/locs?id0=0&id1=8&id2=12&id3=1
	console.log("Wf query : " +id0+","+id1+","+id2+","+id3+";");

	var fil0 = droplists.lists[id1].list0;
	var fil1 = droplists.lists[id1].childeren0[id2].list1;
	var fil2 = droplists.lists[id1].childeren0[id2].childeren1[id3].list2;
	console.log("Wf query : " +fil0+","+fil1+","+fil2+";");

	var result = jsonQuery('[* list0='+fil0+' && list1='+fil1+' && list2='+fil2+']', {
		data: flyput
	}).value;
	//console.log(result);


	res.json(makeFlyput(result));  



	//res.json(locations);  testing file
})


app.get('/locs',function(req, res, next) {
	// /loc?id0=0&id1=0&id2=0&id3=0
	//http://localhost:3000/locs?id0=0&id1=8&id2=12&id3=1
	id0 = req.query.id0
	id1 = req.query.id1
	id2 = req.query.id2
	id3 = req.query.id3
	console.log("Wf query : " +req.query.id0+","+req.query.id1+","+req.query.id2+","+req.query.id3+";");

	var fil0 = droplists.lists[req.query.id1].list0;
	var fil1 = droplists.lists[req.query.id1].childeren0[req.query.id2].list1;
	var fil2 = droplists.lists[req.query.id1].childeren0[req.query.id2].childeren1[req.query.id3].list2;
	console.log("Wf query : " +fil0+","+fil1+","+fil2+";");

	var result = jsonQuery('[* list0='+fil0+' && list1='+fil1+' && list2='+fil2+']', {
		data: flyput
	}).value;

	//console.log(result);

	
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/content/change",
		payload:null
	};

		sendJson(s);
		
console.log("waterfall Set");
	res.json(makeFlyput(result));  


})

/*
app.post('/wf',function(req, res, next) {
	console.log("waterfall Set");

	//no payload for now
	//Todo: send a url 
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/content/change",
		payload:null};

		sendJson(s);
		res.json(success); 


	})
*/

app.post('/guide',function(req, res, next) {
	//receive loc data json	
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/content/show",
		payload:JSON.stringify(req.body)};

		sendJson(s);
		

		res.json(success); 
	})

//TODO : add guide close
app.post('/guide/close',function(req, res, next) {
	//receive loc data json	
	//console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/pano/closeAllShow",
		payload:""};

		sendJson(s);		

		res.json(success); 
	})


app.post('/pano',function(req, res, next) {
	//receive pano jpg json
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success); 
	})

app.post('/pano/ctrl',function(req, res, next) {
	//receive 4 dir key info
	console.log(req.body);
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/control",
		payload:JSON.stringify(req.body)};

		sendJson(s);


		res.json(success); 
	})

app.post('/pano/close',function(req, res, next) {
	//receive pano jpg json
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/flyput/pano/close",
		payload:null};

		sendJson(s);

		res.json(success); 
	})


//VR======================================

app.get('/cls',function(req, res, next) {	


		var newData = JSON.parse(JSON.stringify(classes));

// Insert server url
for(var i  = 0 ; i < newData.classes.length ;i++){					

	for(var j  = 0 ; j < newData.classes[i].files.length ;j++){

		newData.classes[i].files[j].thumb = VRUrl + classes.classes[i].files[j].thumb;	
		newData.classes[i].files[j].path = VRUrl+   classes.classes[i].files[j].path;	
	}

}

	res.json(newData);  


})

app.post('/vr',function(req, res, next) {
	console.log(req.body)
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/vr/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);
		res.json(success); 
	})

app.post('/vr/ctrl',function(req, res, next) {
	//receive 4 dir key info	
	console.log(req.body);

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/270/vr/control",
		payload:JSON.stringify(req.body)};

		sendJson(s);
		res.json(success); 
	})



//LIVE270======================================

app.get('/pj/lvs',function(req, res, next) {	

	res.json(lives);  
})

app.post('/pj/lv',function(req, res, next) {


	//receive  title,lv description,livefeed 
	console.log(req.body)
	res.json(success); 
})

app.post('/pj/lv/ctrl',function(req, res, next) {
	//receive 4 dir key info


	console.log("Lv dir" + req.query.dir);
	res.json(success); 
})


//TO============================================================================

//INFO=========================================

function addWallUrl(data){

	var newData = JSON.parse(JSON.stringify(data));

	for(var i  = 0 ; i < newData.infos.length ;i++){

		for(var j  = 0 ; j < newData.infos[i].Datas.length ;j++){

			for(var k  = 0 ; k < newData.infos[i].Datas[j].medias.length ;k++){

				newData.infos[i].Datas[j].medias[k].url = wallUrl +data.infos[i].Datas[j].medias[k].url;	
				newData.infos[i].Datas[j].medias[k].thumbnail = wallUrl +data.infos[i].Datas[j].medias[k].thumbnail;	

			}
		}
	}
	return newData;
}


app.get('/ifs',function(req, res, next) {	
	// /if?id=0~1
	console.log("infos query:" + req.query.id);


	res.json(addWallUrl(infos));  
//res.json(infosOld);  
})

app.post('/if',function(req, res, next) {
	
	//receive one info pack 


	console.log(req.body)
	
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/class/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);
		res.json(success); 




	})


app.post('/if/ctrl',function(req, res, next) {
	
	//receive one mode
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/class/control",
		payload:JSON.stringify(req.body)};

		sendJson(s);
		res.json(success); 
	})

//Browse=========================================

app.get('/urls',function(req, res, next) {	
	res.json(urls);  
})

app.post('/br/open',function(req, res, next) {	
	//receive public url array
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/public/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success); 
	})

app.post('/br/pr',function(req, res, next) {
	//receive one url	
	console.log(req.body)
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/private/open",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success); 
	})

app.post('/br/pr/login',function(req, res, next) {
	//receive ac, pw , code
	console.log(req.body)

	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/private/login",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success); 
	})
app.post('/br/pr/logout',function(req, res, next) {
	console.log("logout")
	var s  = {
		access_token:"asd12rl;3k2eo1kejf",
		topic:"boch/wall/private/logout",
		payload:JSON.stringify(req.body)};

		sendJson(s);

		res.json(success); 
	})

//LIVETouch======================================

app.get('/to/lvs',function(req, res, next) {	

	res.json(lives);  
})

app.post('/to/lv',function(req, res, next) {

	//receive  title,lv description,livefeed 
	console.log(req.body)
	res.json(success); 
})

app.post('/to/lv/ctrl',function(req, res, next) {
	//receive 4 dir key info


	console.log("Lv dir" + req.query.dir);
	res.json(success); 
})




app.get('/*',function(req, res, next) {
	res.json(fail);  
})

app.post('/*',function(req, res, next) {
	res.json(fail);  
})

