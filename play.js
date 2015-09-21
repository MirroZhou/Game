window.onLoad = function() {
	init();
}
var score;
var ballnum = 100;
var bounds;
var CIRCLE_RADIUS;
var CIRCLE_RADIUS1;
var RSET_X;
var RSET_Y;
var shape = [];
var c = [];
var log;
var welcomeWords;
var leftCircle, rightCircle;
var container;
var childNum;
var downSpeed;
var startBtn;
//定义可能需要的颜色
c[1] = createjs.Graphics.getRGB(243, 112, 33);
c[2] = createjs.Graphics.getRGB(0, 177, 106);
c[3] = createjs.Graphics.getRGB(233, 141, 112);
c[4] = createjs.Graphics.getRGB(0, 82, 156);
var init = function() {
	score = 0;
	downSpeed = 4;
	var ww = document.body.clientWidth;
	console.log(ww);
	var wh = window.screen.height * 0.8;
	CIRCLE_RADIUS = ww * 0.05;
	var canvas = document.getElementById("mycanvas");
	canvas.setAttribute('width', ww);
	canvas.setAttribute('height', wh);
	bounds = new createjs.Rectangle();
	bounds.width = canvas.width;
	bounds.height = canvas.height;
	var font;
	if(bounds.width<400) {font=30;downSpeed=1;}
	else if((bounds.width>=400)&&(bounds.width<800)) {font=40,downSpeed=2;}
	else font=50;
	RSET_X = bounds.width / 2;
	RSET_Y = -150 * 9.5 + bounds.height;
	CIRCLE_RADIUS1 = ((bounds.height / 2) * (bounds.height / 2) + ww * ww * 0.01) / 0.2 / ww;
	stage = new createjs.Stage("mycanvas");
	createjs.Touch.enable(stage);
	container = new createjs.Container();
	welcomeWords=stage.addChild(new createjs.Text("色块大战", "bolder "+font+"px Aria", "#ccc")).set({
		x: bounds.width/2*0.8,
		y: bounds.height/2*0.8,
		lineHeight: 50,
		name:"welcomeWords",
		visible:false
	});
	startBtn=new createjs.Container();
	startBtn.set({
		x: bounds.width/2*0.9,
		y: bounds.height/2*1.5,
		visible:true,
		cursor:"pointer"
	});
    var btn=new createjs.Shape();
	btn.graphics.beginFill(c[3]).drawCircle(0, 0, 50);

	startBtn.addChild(btn);
	startBtn.addChild(new createjs.Text("开始", "bold "+font*0.7+"px Aria", "#fff")).set({
		x: -30,
		y: -10,
		lineHeight: 16.7,
	});
	log = stage.addChild(new createjs.Text("score:0  wrongScore: 0", "bold 30px Aria", "#000")).set({
		x: bounds.width*0.3,
		y: 30,
		lineHeight:10,
		visible:false
	});
	stage.addChild(startBtn);
	stage.addChild(container);
	leftCircle = new createjs.Shape();
	rightCircle = new createjs.Shape();
	container.addChild(leftCircle);
	container.addChild(rightCircle);
	gameIn();
	

}
var clickX;
var handleDown = function(event) {
	clickX = stage.mouseX;
	event.addEventListener("mousemove", handleMove);
}
var handleMove = function(event) {
	var x = stage.mouseX;
	if (event.target.state == "down") {
		if (x < clickX) {
			event.target.state = "left";
			console.log(event.target + event.target.state);
		} else if (x > clickX) {
			event.target.state = "right";
		}
	}
}
var tick = function() {
	for (var i = 0; i < ballnum; i++) {
		if (shape[i].state == "down") {
			//检查图像是否超出了stage的右边界  
			if (shape[i].y + CIRCLE_RADIUS > bounds.height) {
				shape[i].state = 'none';
				//如果有，则重置  
				if (shape[i].color == leftCircle.color || shape[i].color == rightCircle.color) {

					addShapes(leftCircle.color, rightCircle.color, bounds.width / 2, bounds.height);
					gameOver();
				} else {
					wrongFall(shape[i].color);
				}
			}
			//将圆的x坐标移动10像素  
			shape[i].y += downSpeed;
		} else if (shape[i].state == "none") {
			shape[i].alpha = 0;
		} else {
			judgeBounds(shape[i]);
		}
		//重新渲染stage  

	}
	if (stage.getChildByName("rslide") != null) {
		var ls = stage.getChildByName("lslide");
		var rs = stage.getChildByName("rslide");
		var x, width;
		var flag = 1;
		if (ls.x > 0) {
			var sbounds = ls.getBounds();
			ls.x -= 100;
			ls.scaleX = 4;

		} else {
			stage.removeChild(ls);
			flag = 0;
		}
		if (flag) {
			width = ls.width + 10;
			/*rs.setBounds({
				width: ls.width += 10
			});*/
			rs.x += 100;
			rs.scaleX = 4;
		} else {
			stage.removeChild(rs);
		}
	}
	boomsMove();
	log.text = ("score: " + score);
	stage.update();
}
var judgeBounds = function(theShape) {
	theShape.y += 1;
	var bleft = bounds.width * 0.1;
	var bright = bounds.width * 0.9;
	if (theShape.state == "left") {
		if (theShape.x - CIRCLE_RADIUS < bleft) {
			console.log(theShape.x);
			if (theShape.color == leftCircle.color) {
				score++;
				setDownSpeed();
				addBooms(theShape.color, theShape.x - CIRCLE_RADIUS, theShape.y);
			} else {
				addShapes(theShape.color, leftCircle.color, theShape.x - CIRCLE_RADIUS, theShape.y);
				gameOver();
			}
			theShape.state = "none";
		} else {
			theShape.x -= 8;
		}
	} else if (theShape.state == "right") {
		if (theShape.x + CIRCLE_RADIUS >= bright) {

			if (theShape.color == rightCircle.color) {
				score++;
				setDownSpeed();
				addBooms(theShape.color, theShape.x - CIRCLE_RADIUS, theShape.y);
			} else {

				addShapes(theShape.color, rightCircle.color, theShape.x - CIRCLE_RADIUS, theShape.y);
				gameOver();
			}
			theShape.state = "none";
		} else {
			theShape.x += 8;
		}

	}

}
var wrongFall = function(color) {
	var length = 100;
	var height = 3;
	var slide1 = new createjs.Shape();
	slide1.graphics.beginFill(c[color]).drawRect(0, 0, length, height);
	var slide2 = new createjs.Shape();
	slide2.graphics.beginFill(c[color]).drawRect(0, 0, length, height);
	slide1.name = "lslide";
	slide2.name = "rslide";
	slide1.x = bounds.width / 2 - length - 10;
	slide2.x = bounds.width / 2 + 10;
	slide1.y = bounds.height - height;
	slide2.y = bounds.height - height;
	stage.addChild(slide1);
	stage.addChild(slide2);
	stage.update();

}
var addBooms = function(color, x, y) {

	if (stage.getChildByName("booms") != null) return;
	var container = new createjs.Container();
	container.name = "booms";
	stage.addChild(container);
	var count = 20;
	var length = Math.random() * 50 + 20;
	var boom = new createjs.Shape();
	boom.name = "boom";
	for (var i = 0; i < count; i++) {
		var newboom = boom.clone();
		newboom.graphics.beginFill(c[color]).drawRect(0, 0, length, 5);
		newboom.x = Math.random() * 400 + x;
		newboom.y = Math.random() * 400 + y;
		newboom.rotation = Math.random() * 360;
		container.addChild(newboom);
	}
	console.log(container.toString());
	childNum = 20;
	stage.update();

}
var addShapes = function(color1, color2, x, y) {
	if (stage.getChildByName("booms") != null) return;
	var container = new createjs.Container();
	container.name = "booms";
	stage.addChild(container);
	var count = 50;
	var rect = new createjs.Shape();
	var recNum = 50 * Math.random();
	for (var i = 0; i < recNum; i++) {
		var newRec = rect.clone();
		newRec.graphics.beginStroke(c[color1]).drawRect(0, 0, 10, 10);
		newRec.x = Math.random() * 400 + x;
		newRec.y = Math.random() * 400 + y;
		newRec.rotation = Math.random() * 180;
		container.addChild(newRec);
	}
	for (var j = 0; j < 50 - recNum; j++) {
		var newCir = rect.clone();
		newCir.graphics.beginStroke(c[color2]).drawCircle(0, 0, 10);
		newCir.x = Math.random() * 400 + x;
		newCir.y = Math.random() * 400 + y;
		newCir.rotation = Math.random() * 180;
		container.addChild(newCir);
	}
	childNum = 50;
	stage.update();
}
var boomsMove = function() {
	var container = stage.getChildByName("booms");
	if (container == null) return;
	for (var i = 0; i < childNum; i++) {
		var thisBoom = container.getChildAt(i);
		if (thisBoom.alpha > 0) {
			var j = Math.random();
			var q = Math.random();
			thisBoom.x += (j - 0.5) * q * 100;
			thisBoom.y += (q - 0.5) * j * 100;
			thisBoom.rotation -= 2.5;
			thisBoom.alpha -= 0.015;
		} else {
			stage.removeChild(container);
			return;
		}
	}
}
var setDownSpeed = function() {
	if (parseInt(score / 10) == (score / 10)) {
		downSpeed += 1;
	}
}
var gameIn = function(){
	var num1=Math.ceil(Math.random()*4);
	var num2=Math.ceil(Math.random()*4);
	while(num2==num1){
		num2=Math.ceil(Math.random()*4);
	}
	leftCircle.graphics.beginFill(c[num1]).drawCircle(-CIRCLE_RADIUS1 + bounds.width * 0.1, bounds.height / 2, CIRCLE_RADIUS1);
	leftCircle.color = num1;
	rightCircle.graphics.beginFill(c[num2]).drawCircle(bounds.width * 0.9 + CIRCLE_RADIUS1, bounds.height / 2, CIRCLE_RADIUS1);
	rightCircle.color = num2;
	welcomeWords.visible=true;
	startBtn.addEventListener("click",gameStart);
	stage.update();
}
var gameStart = function() {

	score=0;
	welcomeWords.visible=false;
	startBtn.visible=false;
	log.visible=true;
    var num;
	var fallsContainer=new createjs.Container();
	fallsContainer.name="fallsContainer";
	stage.addChild(fallsContainer);
	for (var i = 0; i < ballnum; i++) {
		var random = Math.random() * 100;
		if(random<20){num=leftCircle.color;}
		else if((random>20)&&(random<40)) num=rightCircle.color;
		else num=Math.ceil(Math.random()*4);
		shape[i] = new createjs.Shape();
		shape[i].graphics.beginFill(c[num]).drawCircle(0, 0, CIRCLE_RADIUS);
		shape[i].state = "down";
		shape[i].color = num;
		shape[i].x = RSET_X;
		shape[i].y = -CIRCLE_RADIUS - 3 * CIRCLE_RADIUS * i;
		fallsContainer.addChild(shape[i]);
	}
	fallsContainer.addEventListener("mousedown", handleDown);
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(80);
}
var gameOver = function() {
	log.visible=false;
	var container=stage.getChildByName("fallsContainer");
	stage.removeChild(container);
	stage.removeEventListener("tick");
	welcomeWords.text=score+"分！"
	welcomeWords.visible=true;
	startBtn.visible=true;

}
