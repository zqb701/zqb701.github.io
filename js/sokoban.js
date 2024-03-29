﻿
		var canvas = document.getElementById("canvas");
		var msg = document.getElementById("msg");
		var cxt = canvas.getContext("2d");

		var w = 35,h = 35;
		var curMap;//当前的地图
		var curLevel;//当前等级的地图
		var curMan;//初始化小人
		var iCurlevel = 0;//关卡数
		var moveTimes = 0;//移动了多少次
		var finishCount = 0;    //duck:改用計數器判斷是否完成
		let goalCount = 0;        //duck:已完成的數目, 關卡初始值不一定為零
		let controlMode = false;

		const BLOCK0      = 0;
		const WALL1       = 1;
		const BOX2        = 2;
		const GOAL3       = 3;
		const WORKER4     = 4;
		const BOXGOAL5    = 5;    //3+2
		const WORKERGOAL7 = 7;//3+4

		//预加载所有图片
		var oImgs = {
			"block"  : "images/block.png",
			"wall"   : "images/wall.png",
			"box"    : "images/box.png",
			"ball"   : "images/ball.png",
            "worker" : "images/worker.png",    //duck:工人改為單一圖片			
			"ballbox": "images/ballbox.png",    //duck增加已完成項目別


			"up"   : "images/up.png",
			"down" : "images/down.png",
			"left" : "images/left.png",
			"right": "images/right.png",
		}
		function imgPreload(srcs,callback){
			var count = 0,imgNum = 0,images = {};

			for(src in srcs){
				imgNum++;
			}
			for(src in srcs ){

				images[src] = new Image();
				images[src].onload = function(){
					//判断是否所有的图片都预加载完成
					if (++count >= imgNum){
						callback(images);
					}
				}
				images[src].src = srcs[src];
				//duck:相當於images[black] = "images/black.png"
			}
		}
		var block,wall,box,ball,ballbox, up,down,left,right;
		imgPreload(oImgs,function(images){
			//console.log(images.block);
			block = images.block;
			wall = images.wall;
			box = images.box;
			ball = images.ball;
			ballbox = images.ballbox;//duck增加已完成項目別
			worker = images.worker;//duck

			up = images.up;
			down = images.down;
			left = images.left;
			right = images.right;
			init();
		});
		//初始化游戏
		function init(){
			//InitMap();
			//DrawMap(levels[0]);
			w = block.width;
			h = block.height;

			initLevel();//初始化对应等级的游戏
			showMoveInfo();//初始化对应等级的游戏数据
		}
		//绘制地板
		//duck: 地板與其它物件一起畫即可,完全不用改DrawMap()
		function InitMap(){
			for (var i=0;i<16 ;i++ ){
				for (var j=0;j<16 ;j++ ){
					//cxt.drawImage(block,w*j,h*i,w,h);
				}
			}
		}
		//小人位置坐标
		function Point(x,y){
			this.x = x;
			this.y = y;
		}
		var p0 = new Point(5,5);//小人的初始标值
		//绘制每个游戏关卡地图
		function DrawMap(level){
			for (var i=0;i<level.length ;i++ ){
				for (var j=0;j<level[i].length ;j++ ){
					var pic = block;//初始图片
					switch (level[i][j]){
					case 1://绘制墙壁
						pic = wall;
						break;
					case 2://绘制陷进
						pic = ball;
						goalCount++;
						break;
					case 3://绘制箱子
						pic = box;
						break;
					case 4://绘制小人
						//pic = curMan;//小人有四个方向 具体显示哪个图片需要和上下左右方位值关联
						//获取小人的坐标位置
						pic = worker;    //duck:工人使用單一圖片
						p0.x = i;
						p0.y = j;
						//alert("p0.x="+p0.x+", p0.y="+p0.y+", curLevel="+curLevel[p0.x][p0.y]);
						break;
					case 5://绘制箱子及陷进位置
						//pic = box;
						pic = ballbox;//duck增加已完成項目別
						finishCount++;
						goalCount++;
						break;
					}
					//每个图片不一样宽 需要在对应地板的中心绘制地图
//					cxt.drawImage(pic,w*j-(pic.width-w)/2,h*i-(pic.height-h),pic.width,pic.height);
                    paintCell(pic,i,j);
				}
			}
		}
		//duck:
		function paintCell(cellPic, cellColumn, cellRaw){
			var left = w*cellRaw-(cellPic.width-w)/2;
			var top  = h*cellColumn-(cellPic.height-h);
            cxt.drawImage(cellPic,left,top);
		}
		//初始化游戏等级
		function initLevel(){
			curMap = copyArray(levels[iCurlevel]);//当前移动过的游戏地图
			curLevel = levels[iCurlevel];//当前等级的初始地图
			curMan = down;//初始化小人 duck:小人的方向
			
			canvas.width = curMap[0].length * w;
			canvas.height = curMap.length * h;
			console.log(curMap.length+ ", " + curMap[0].length);
			cxt.fillStyle = '#333';
            cxt.fillRect(0, 0, canvas.width, canvas.height);

//			InitMap();//初始化地板
			DrawMap(curMap);//绘制出当前等级的地图
		}
		//下一关
		function NextLevel(i){
			//iCurlevel当前的地图关数
			iCurlevel = iCurlevel + i;
			if (iCurlevel<0){
				iCurlevel = 0;
				return;
			}
			var len = levels.length;
			if (iCurlevel > len-1){
				iCurlevel = len-1;
			}
			finishCount = 0;
			goalCount = 0;
			initLevel();//初始当前等级关卡
			moveTimes = 0;//游戏关卡移动步数清零
			showMoveInfo();//初始化当前关卡数据
		}
		//小人移动
		function go(dir){
			var p1,p2;    //duck:p1是前一格,p2是前一格的前一格
			switch (dir){
			case "up":
				curMan = up;
				//获取小人前面的两个坐标位置来进行判断小人是否能够移动
				//duck:整併成只處理變化量
				p1 = new Point(p0.x-1,p0.y);
				p2 = new Point(p0.x-2,p0.y);
				break;
			case "down":
				curMan = down;
				p1 = new Point(p0.x+1,p0.y);
				p2 = new Point(p0.x+2,p0.y);
				break;
			case "left":
				curMan = left;
				p1 = new Point(p0.x,p0.y-1);
				p2 = new Point(p0.x,p0.y-2);
				break;
			case "right":
				curMan = right;
				p1 = new Point(p0.x,p0.y+1);
				p2 = new Point(p0.x,p0.y+2);
				break;
			}
			//若果小人能够移动的话，更新游戏数据，并重绘地图
			//alert(curMap[p0.x][p0.y]+","+curMap[p1.x][p1.y]+","+curMap[p2.x][p2.y]);
			if (Trygo(p1,p2)){
				moveTimes ++;
				showMoveInfo();
			}
			//alert(curMap[p0.x][p0.y]+","+curMap[p1.x][p1.y]+","+curMap[p2.x][p2.y]);
			
			//重绘地板 //duck:有移動才要重畫
//			InitMap();
			//重绘当前更新了数据的地图
//			DrawMap(curMap);
			//每走一步要全圖重畫兩次???最多把人物擋到的6格重繪即可。

			//若果移动完成了进入下一关
//			if (checkFinish()){    //duck:有移動才要檢查
if (finishCount == goalCount){
        //定时器解决渲染地图后再弹窗 //duck:這是可以繼續把圖畫完的意思
        setTimeout(()=>{
          alert("完成！！");//duck:用對話框不搭
	  NextLevel(1);
          //controlMode = true;
	//paintpass();//尚缺過場圖片  
        },0)
				
			}
		}


		//判断是否推成功 duck:以原圖的目標與新圖的箱子比對。改用一個「完成計數器」初始檢查旗標為5的量,再增減即可。
		function checkFinish(){
			for (var i=0;i<curMap.length ;i++ ){
				for (var j=0;j<curMap[i].length ;j++ ){
					//当前移动过的地图和初始地图进行比较，若果初始地图上的陷进参数在移动之后不是箱子的话就指代没推成功
					if (curLevel[i][j] == 2 && curMap[i][j] != 3 || curLevel[i][j] == 5 && curMap[i][j] != 3){
						return false;
					}
				}
			}
			return true;
		}
		//判断小人是否能够移动
		function Trygo(p1,p2){
			
			/*
			if(p1.x<0) return false;//若果超出地图的上边，不通过
			if(p1.y<0) return false;//若果超出地图的左边，不通过
			if(p1.x>curMap.length) return false;//若果超出地图的下边，不通过
			if(p1.y>curMap[0].length) return false;//若果超出地图的右边，不通过
			*/ //duck:關卡應確保有牆, 故上面4行不需要

			if(curMap[p1.x][p1.y]==1) return false;//若果前面是墙，不通过
			
			if(curMap[p1.x][p1.y]==3 || curMap[p1.x][p1.y]==5){
				//若果小人前面是箱子那就还需要判断箱子前面有没有障碍物(箱子/墙)
				if (curMap[p2.x][p2.y]==1 || curMap[p2.x][p2.y]==3 || curMap[p2.x][p2.y]==5){
					return false;
				}

				if(curMap[p2.x][p2.y] == BOX2){
					//alert("ok");
					curMap[p2.x][p2.y] += GOAL3;
					pic = ballbox;
					finishCount++;//duck:增加完成數
				}else{
					//若果判断不成功小人前面的箱子前进一步
				curMap[p2.x][p2.y] = 3 ;//更改地图对应坐标点的值
				//console.log(curMap[p2.x][p2.y]);
				pic=box;//duck:下下格為箱子				
				}
				if(curMap[p1.x][p1.y]==5){
					finishCount--;
				}

				paintCell(pic, p2.x, p2.y);
			}
			//若果都没判断成功小人前进一步
			curMap[p1.x][p1.y] = 4;//更改地图对应坐标点的值
			paintCell(worker, p1.x, p1.y);

			//若果小人前进了一步，小人原来的位置如何显示
			var v = curLevel[p0.x][p0.y];
			if (v!=2){//若果刚开始小人位置不是陷进的话
						
				if (v==5){//可能是5 既有箱子又陷进 duck:小人的原位置不可能是箱子
					v=2;//若果小人本身就在陷进里面的话移开之后还是显示陷进
				    pic=ball;//duck:前一格為目標

		            //finishCount--;//duck:若原為5則減少完成數
				}else{
					v=0;//小人移开之后之前小人的位置改为地板
					pic=block;//duck:前一格為地板
				}
				
			}else{
				pic=ball;//duck:前一格為目標
			}
			
            paintCell(pic, p0.x, p0.y);
			
			
			//重置小人位置的地图参数
			curMap[p0.x][p0.y] = v;
			//若果判断小人前进了一步，更新坐标值
			p0 = p1;
			//若果小动了 返回true 指代能够移动小人
			return true;
		}
		//判断是否推成功
		//与键盘上的上下左右键关联
		function doKeyDown(event){
			if(controlMode){
				switch (event.keyCode){
				case 37://左键头
                case 65://<A>
					NextLevel(0);//重玩
				    break;
				case 39://右箭头
				case 68://<D>
				    //沒有下一關...
					NextLevel(1);//下一關
					break;
				}
				controlMode = false;
				return false;
			}
			//alert(event.keyCode);
			switch (event.keyCode){
				case 37://左键头
                case 65://<A>
				    go("left");
				    break;
				case 38://上键头
				case 87://<W>
					go("up");
					break;
				case 39://右箭头
				case 68://<D>
					go("right");
					break;
				case 40://下箭头
				case 83://<S>
					go("down");
					break;
				case 33://PgUp
					NextLevel(-1);//上一關
					break;
				case 34://PgDn
					NextLevel(1);//下一關
					break;
				case 8://<Backspace>
					//上一步, 待實作
					break
				case 72://<h> for help
					showHelp();
					break;
				case 27://<esc>
					NextLevel(0);//重玩
					break;
			}
		}

		//完善关卡数据及游戏说明
		function showMoveInfo(){
			msg.innerHTML = "第" + (iCurlevel+1) +"關, 移動次數: "+ moveTimes+ ", 完成數:" + finishCount+"/"+goalCount;
		}
		//游戏说明
		var showhelp = false;
		function showHelp(){
			showhelp = !showhelp;
			if (showhelp){
				msg.innerHTML = "略。";
			}else{
				showMoveInfo();
			}
		}

		//克隆二维数组
		function copyArray(arr){
			var b=[];//每次移动更新地图数据都先清空再添加新的地图
			for (var i=0;i<arr.length ;i++ ){
				b[i] = arr[i].concat();//链接两个数组
			}
			return b;
		}