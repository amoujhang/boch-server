


app.get('/', function (req, res) {
	console.log("get list");
	//res.json(catagory);	
	res.send("hello");
})

app.post('/login',function(req, res, next) {
    var ac = req.body.ac;
    var pw = req.body.pw;
 console.log("login");
    if(ac == "admin" && pw == "1234") {
        res.json(success);
    }
    else {
        res.json(fail);
    }
})


app.get('/pj/wf/dp/:dpId', function (req, res) {	
console.log("dp=" + req.params.dpId);
	res.json(dropdowns);	
})

app.get('/pj/wf/dp/:dpId/cg/:cgId', function (req, res) {
		
	res.send("success");	
})

app.get('/pj/wf/dp/:dpId/cg/:cgId/locs', function (req, res) {
	console.log("dp=" + req.params.dpId+"cg=" + req.params.cgId);	
	res.json(locations);	
})


app.get('/pj/wf/dp/:dpId/cg/:cgId/loc/:locId/guide', function (req, res) {
	console.log("guide set");	
	res.send("success");	
})

app.get('/pj/wf/dp/:dpId/cg/:cgId/loc/:locId/panos', function (req, res) {
	console.log("dp=" + req.params.dpId+"cg=" + req.params.cgId+"loc=" +req.params.locId);	
	res.json(panos);	
})

app.get('/pj/wf/dp/:dpId/cg/:cgId/loc/:locId/pano/:panoId', function (req, res) {
	
	res.send("success");	
})


//wf ====================================================================================================


app.get('/pj/ss', function (req, res) {
	//console.log("set slideshow");
		res.send("success");	
})



app.get('/pj/vr/cls', function (req, res) {
	
		res.json(classes);		
})

app.get('/pj/vr/cl/:clId/fls', function (req, res) {
	console.log("cl=" + req.params.clId);	
		res.json(files);		
})

app.get('/pj/vr/cl/:clId/fl/:flId', function (req, res) {
	console.log("cl=" + req.params.clId+"fl=" + req.params.flId);	
		res.json(file);			
})

app.get('/pj/vr/cl/:clId/fl/:flId/start', function (req, res) {
	
		res.send("success");			
})



app.get('/pj/lvs', function (req, res) {
	
	res.json(lives);	
})


app.get('/pj/lv/:lvId/start', function (req, res) {
	
		res.send("success");			
})



app.get('/to/if/:thId/cls', function (req, res) {
	
	res.json(tclasses);	
})

app.get('/to/if/:thId/cl/:clId/single', function (req, res) {
	
		res.send("success");			
})


app.get('/to/if/:thId/cl/:clId/triple', function (req, res) {
	
		res.send("success");			
})


app.get('/to/lvs', function (req, res) {
	
	res.json(lives);	
})

app.get('/to/lv/:lvId/start', function (req, res) {
	
		res.send("success");			
})


app.get('/to/br/0/start', function (req, res) {
	
		res.send("success");			
})

app.post('/to/br/:brId/login',function(req, res, next) {
    var ac = req.body.ac;
    var pw = req.body.pw;
 console.log("login");
    if(ac == "admin" && pw == "1234") {
        res.send("success");
    }
    else {
        res.send("fail");
    }
})

app.get('/to/br/:brId/logout',function(req, res, next) {
  res.send("success");
})


// old ==========================================================



///BR

get //  query
set open br = url 

set private = url 
set login = ac, pw , code
set logout


//LIVETouch======================================

app.get('/lvts',function(req, res, next) {	
        res.json(lives);  
})

app.post('/lvt',function(req, res, next) {
	//receive  title,lv description,livefeed 
	 res.json(success); 
})

app.post('/lvt/rot',function(req, res, next) {
	//receive 4 dir key info
	// /lvt/rot?dir=0
	console.log("Lv dir" + req.query.dir);
	 res.json(success); 
})



//WF 
set sildeshow //or data

////DP

get droplist  ?=id

get locs  ?=id*4 

set wf locations // remember 4id 

set wf guide  = title ,thumb , desc , url(more) //send all
set wf pano = panoJPG 
set pan  =  pan 4*id

////VR

get classes = cls > title ,thumb,type , video or JPG ,description

set VR = send all title ,thumb,type , video or JPG ,description
set VR pan =  pan 4*id

////LV

get lvs = lv title,lv description,livefeed 
set Lv = send all
set pan = pan 4*id

//TO

////IF

get IfList id 0~1
get each cls take all

set if = send all
// title , mode ,content //what content


////BR

get //  query
set open br = url 

set private = url 
set login = ac, pw , code
set logout

////LV


get lvs = lv title,lv description,livefeed 
set Lv = send all
set pan = pan 4*id