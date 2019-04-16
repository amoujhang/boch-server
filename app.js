
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var jsonQuery = require('json-query');
var dir = require('node-dir');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
//var dropdowns = require('./data/Dropdowns.json')
var droplists = require('./data/DropLists.json');
var droplistsmenu2 = require('./data/DropListsMenu2.json');
var droplistsmenu3 = require('./data/DropListsMenu3.json');
var locations = require('./data/Locations.json');
var classes = require('./data/Classes.json');
var lives = require('./data/Lives.json');
var infos = require('./data/Infos.json');
var urls = require('./data/Urls.json');
var ss = require('./data/SlideShow.json');
var success = require('./data/success.json');
var fail = require('./data/fail.json');
var flyput = require('./data/flyPutDataGen.json');
var flyput3 = require('./data/flyPutDataGen3.json');
var config = require('./config.js');

var app = express();

var wallUrl = "http://" + config.serverIp + ":" + config.port + "/static/wall/";
var flyputUrl = "http://" + config.serverIp + ":" + config.port + "/static/flyput/";
var VRUrl = "http://" + config.serverIp + ":" + config.port + "/static/VR/";

app.use(bodyParser.urlencoded({
		extended: true
	}));
app.use(bodyParser.json());
app.use('/static', express.static(config.staticPath));

var listener = app.listen(config.port, function () {
		console.log("app is running on port " + config.port);
	});

function sendJson(Data) {
	var clientServerOptions = {
		uri: 'http://13share.me:8100/mqtt',
		body: JSON.stringify(Data),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}
	request(clientServerOptions, function (error, response) {
		console.log(error, response.body);
		return;
	});
}

app.get('/file', function (req, res, next) {

	const directoryPath = path.join(__dirname, 'public/panos');

	dir.files(directoryPath, function (err, files) {
		if (err)
			throw err;

		res.json(files);

	});

})

app.post('/login', function (req, res, next) {
	var ac = req.body.ac;
	var pw = req.body.pw;
	console.log("login");
	if (ac == "admin" && pw == "1234") {
		res.json({
			"IsSuccess": true,
			"Message": ""
		});
	} else {
		res.json({
			"IsSuccess": false,
			"Message": "帳號密碼有誤"
		});
	}
})

//270============================================================================


//SS======================================


app.get('/ss', function (req, res, next) {
	console.log("Get Slideshow");
	request('http://192.168.2.100:3000/api/v1/standby_media_sildeshow?AuthToken=tech13999', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('ss status code 200')
			console.log(body) // 打印google首页
			res.send(body);
		} else {
			console.log('ss status error')
			res.json(ss);
		}
	})
})

app.post('/ss', function (req, res, next) {
	console.log('post ss')
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/idle/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

//DP======================================
/*
request('http://192.168.2.100:3000/api/v1/material_guides_dropdownlist/1\?AuthToken\=tech13999', function (error, response, body) {
if (!error && response.statusCode == 200) {
console.log('get dplists0 status code 200')
droplists = JSON.parse(body)
} else {
console.log('dplists0 status error')
}
})
request('http://192.168.2.100:3000/api/v1/material_guides_dropdownlist/2\?AuthToken\=tech13999', function (error, response, body) {
if (!error && response.statusCode == 200) {
console.log('get dplists1 status code 200')
droplistsmenu2 = JSON.parse(body)
} else {
console.log('dplists1 status error')
}
})
request('http://192.168.2.100:3000/api/v1/material_guides_dropdownlist/3\?AuthToken\=tech13999', function (error, response, body) {
if (!error && response.statusCode == 200) {
console.log('get dplists2 status code 200')
droplistsmenu3 = JSON.parse(body)
} else {
console.log('dplists2 status error')
}
})
 */
app.get('/dplists', function (req, res, next) {
	console.log("Dp query : " + req.query.id + ";");
	//  res.json(success);
	if (req.query.id == '0') {
		res.json(droplists);
	} else if (req.query.id == '1') {
		res.json(droplistsmenu2);
	} else {
		res.json(droplistsmenu3);
	}
	//res.json(small);
})

function makeFlyput(data) {

	var newData = JSON.parse(JSON.stringify(data));

	// Change server url
	for (var i = 0; i < newData.length; i++) {

		var unwanted = "E:/Downloads/boch-image/";
		newData[i].cover_url = newData[i].cover_url.replace(unwanted, flyputUrl);
		/*
		for (var j = 0; j < newData[i].panorama_list.length; j++) {

		newData[i].panorama_list[j].thumb = flyputUrl + data[i].panorama_list[j].thumb;
		newData[i].panorama_list[j].path = flyputUrl + data[i].panorama_list[j].path;
		}
		 */
	}

	// Add rootObject
	var dataJson = {};
	dataJson.locations = newData;

	return dataJson;
}

request('http://192.168.2.100:3000/api/v1/material_guides_dumpdata\?AuthToken\=tech13999', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		console.log('get flyput status code 200')
		flyput = JSON.parse(body)
			console.log('get flyput finished')
	} else {
		console.log('flyput status error')
	}
})

var id0 = 0;
var id1 = 0;
var id2 = 0;
var id3 = 0;

app.get('/fly', function (req, res, next) {
	// /loc?id0=0&id1=0&id2=0&id3=0
	//http://localhost:3000/locs?id0=0&id1=8&id2=12&id3=1
	console.log("Wf query : " + id0 + "," + id1 + "," + id2 + "," + id3 + ";");

	var usedp = '';
	if (id0 == 0) {
		usedp = droplists;
	} else if (id0 == 1) {
		usedp = droplistsmenu2;
	} else {
		usedp = droplistsmenu3;
	}

	if (id0 != 2) {
		var fil0 = usedp.lists[id1].list0;
		var fil1 = usedp.lists[id1].childeren0[id2].list1;
		var fil2 = usedp.lists[id1].childeren0[id2].childeren1[id3].list2;
		console.log("Wf query : " + fil0 + "," + fil1 + "," + fil2 + ";");
		var result = jsonQuery('[* list0=' + fil0 + ' && list1=' + fil1 + ' && list2=' + fil2 + ']', {
				data: flyput
			}).value;
		res.json(makeFlyput(result));
	} else {
		var fil0 = usedp.lists[id1].list0;
		console.log("Wf query : " + fil0 + "," + fil1 + "," + fil2 + ";");
		var result = jsonQuery('[* list0=' + fil0 + ']', {
				data: flyput
			}).value;
		res.json(makeFlyput(result));
	}
})

app.get('/locs', function (req, res, next) {
	// /loc?id0=0&id1=0&id2=0&id3=0
	//http://localhost:3000/locs?id0=0&id1=8&id2=12&id3=1
	id0 = req.query.id0;
	id1 = req.query.id1;
	id2 = req.query.id2;
	id3 = req.query.id3;
	console.log("Wf query : " + req.query.id0 + "," + req.query.id1 + "," + req.query.id2 + "," + req.query.id3 + ";");

	var usedp = '';
	if (id0 == 0) {
		usedp = droplists;
	} else if (id0 == 1) {
		usedp = droplistsmenu2;
	} else {
		usedp = droplistsmenu3;
	}
	var result = '';
	if (id0 != 2) {
		var fil0 = usedp.lists[id1].list0;
		var fil1 = usedp.lists[id1].childeren0[id2].list1;
		var fil2 = usedp.lists[id1].childeren0[id2].childeren1[id3].list2;
		console.log("Wf query : " + fil0 + "," + fil1 + "," + fil2 + ";");
		result = jsonQuery('[* list0=' + fil0 + ' && list1=' + fil1 + ' && list2=' + fil2 + ']', {
				data: flyput
			}).value;
	} else {
		var fil0 = usedp.lists[id1].list0;
		console.log('fil0:' + fil0)
		console.log("Wf query : " + fil0 + "," + fil1 + "," + fil2 + ";");
		result = jsonQuery('[* list0=' + fil0 + ']', {
				data: flyput
			}).value;
	}

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/content/change",
		payload: null
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

app.post('/guide', function (req, res, next) {
	//receive loc data json
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/content/show",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

//TODO : add guide close
app.post('/guide/close', function (req, res, next) {
	//receive loc data json
	//console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/pano/closeAllShow",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.post('/pano', function (req, res, next) {
	//receive pano jpg json
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

app.post('/pano/ctrl', function (req, res, next) {
	//receive 4 dir key info
	console.log(req.body);
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/control",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

app.post('/pano/close', function (req, res, next) {
	//receive pano jpg json
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/pano/close",
		payload: null
	};

	sendJson(s);

	res.json(success);
})

//VR======================================

app.get('/cls', function (req, res, next) {

	request('http://192.168.2.100:3000/api/v1/vr_lessons_dumplesson?AuthToken=tech13999', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('get infos status code 200')
			res.send(body)
		} else {
			console.log('infos status error')
			var newData = JSON.parse(JSON.stringify(classes));

			// Insert server url
			for (var i = 0; i < newData.classes.length; i++) {

				for (var j = 0; j < newData.classes[i].files.length; j++) {

					newData.classes[i].files[j].thumb = VRUrl + classes.classes[i].files[j].thumb;
					newData.classes[i].files[j].path = VRUrl + classes.classes[i].files[j].path;
				}

			}

			res.json(newData);
		}
	})

})

app.post('/vr', function (req, res, next) {
	console.log(req.body)
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/vr/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);
	res.json(success);
})

app.post('/vr/ctrl', function (req, res, next) {
	//receive 4 dir key info
	console.log(req.body);

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/vr/control",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);
	res.json(success);
})

//LIVE270======================================

app.get('/pj/lvs', function (req, res, next) {
	request('http://192.168.2.100:3000/api/v1/live_cast_stream/1\?AuthToken\=tech13999', function (error, response, body) {
		if (!error && response.statusCode == 200) {			
			res.send(body);
		} else {
			res.json(lives);
		}
	})
})
app.post('/pj/lv', function (req, res, next) {
	//receive  title,lv description,livefeed
	console.log(req.body)
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/lv/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})
app.post('/pj/lv/ctrl', function (req, res, next) {
	//receive ctrl info
	console.log(req.body)
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/lv/ctrl",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

//Exe=====================
app.post('/wf/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/flyput/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.post('/vr/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/vr/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.post('/pj/lv/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/270/lv/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

//TO============================================================================

//INFO=========================================

function addWallUrl(data) {

	var newData = JSON.parse(JSON.stringify(data));

	for (var i = 0; i < newData.infos.length; i++) {

		for (var j = 0; j < newData.infos[i].Datas.length; j++) {

			for (var k = 0; k < newData.infos[i].Datas[j].medias.length; k++) {

				newData.infos[i].Datas[j].medias[k].url = wallUrl + data.infos[i].Datas[j].medias[k].url;
				newData.infos[i].Datas[j].medias[k].thumbnail = wallUrl + data.infos[i].Datas[j].medias[k].thumbnail;

			}
		}
	}
	return newData;
}

app.get('/ifs', function (req, res, next) {
	// /if?id=0~1
	//console.log("infos query:" + req.query.id);
	//res.json(addWallUrl(infos));
	request('http://192.168.2.100:3000/api/v1/tp_vr_lessons_dumplesson?AuthToken=tech13999', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('get infos status code 200')
			res.send(body)
		} else {
			console.log('infos status error')
			res.json(addWallUrl(infos));
		}
	})
})

app.post('/if', function (req, res, next) {

	//receive one info pack


	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/class/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);
	res.json(success);

})

app.post('/if/ctrl', function (req, res, next) {

	//receive one mode
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/class/control",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);
	res.json(success);
})

//Browse=========================================

app.get('/urls', function (req, res, next) {
	res.json(urls);
})

app.post('/br/open', function (req, res, next) {
	//receive public url array
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/public/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

app.post('/br/pr', function (req, res, next) {
	//receive one url
	console.log(req.body)
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/private/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

app.post('/br/pr/login', function (req, res, next) {
	//receive ac, pw , code
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/private/login",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})
app.post('/br/pr/logout', function (req, res, next) {
	console.log("logout")
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/private/logout",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})

//LIVETouch======================================

app.get('/to/lvs', function (req, res, next) {

	res.json(lives);
})
app.post('/to/lv', function (req, res, next) {
	//receive  title,lv description,livefeed
	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/lv/open",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})
app.post('/to/lv/ctrl', function (req, res, next) {
	//receive ctrl info
	console.log(req.body)
	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/lv/ctrl",
		payload: JSON.stringify(req.body)
	};

	sendJson(s);

	res.json(success);
})
//Exe=====================
app.post('/if/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/class/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.post('/pr/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/private/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.post('/to/lv/exe', function (req, res, next) {

	console.log(req.body)

	var s = {
		access_token: "asd12rl;3k2eo1kejf",
		topic: "boch/wall/lv/exe",
		payload: ""
	};

	sendJson(s);

	res.json(success);
})

app.get('/*', function (req, res, next) {
	res.json(fail);
})

app.post('/*', function (req, res, next) {
	res.json(fail);
})
