function direction() {
    $.miniNoty('<div style="font-size: 18pt">左键单击: 画像素<br>右键单击: 取色<br>右键拖动: 移动画布<br>滚轮: 缩放</div>','normal');
}
$.miniNotyConfig.set({ // set global config
    timeoutToHide: 5000, // any params
    //timeoutAnimEnd: 600
});
var debugFlag=false;
//debugFlag=true;
var serverUrl=debugFlag?'pixel.local/index':'pixelfun.top';

var scaleX = 300;
var scaleY = 300;
var scale = 8;
var showScale = scaleX / 200;
var zoomX = 0;
var zoomY = 0;
var zoomW = $(window).width(), zoomH = $(window).height();
var offsetX=0;
var offsetY=0;

var canvas = document.getElementById('pic');
var ctx = canvas.getContext('2d');
canvas.width = scaleX;
canvas.height = scaleY;
ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.fillStyle = "#fcfcfc";
ctx.fillRect(0, 0, scaleX, scaleY);

var picRect = document.getElementById('picRect');
var picRectCtx = picRect.getContext('2d');
picRect.width = 200;
picRect.height = 200;
picRectCtx.imageSmoothingEnabled = false;
picRectCtx.mozImageSmoothingEnabled = false;
picRectCtx.webkitImageSmoothingEnabled = false;
picRectCtx.msImageSmoothingEnabled = false;

var color = document.getElementById('color');

var zoom = document.getElementById('zoom');
var zoomctx = zoom.getContext('2d');
zoom.width = zoomW;
zoom.height = zoomH;
zoomctx.imageSmoothingEnabled = false;
zoomctx.mozImageSmoothingEnabled = false;
zoomctx.webkitImageSmoothingEnabled = false;
zoomctx.msImageSmoothingEnabled = false;

var grid = document.getElementById('grid');
var gridctx = grid.getContext('2d');

var down = document.getElementById('download');
var downCtx = down.getContext('2d');
var idata;
var gridShow=document.getElementById("gridShow");
function init() {
    scale = 8;
    showScale = scaleX / 200;
    zoomX = 0;
    zoomY = 0;
    zoomW = $(window).width(), zoomH = $(window).height();
    offsetX=0;
    offsetY=0;

    canvas.width = scaleX;
    canvas.height = scaleY;
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.fillStyle = "#fcfcfc";
    ctx.fillRect(0, 0, scaleX, scaleY);

    picRect.width = 200;
    picRect.height = 200;
    picRectCtx.imageSmoothingEnabled = false;
    picRectCtx.mozImageSmoothingEnabled = false;
    picRectCtx.webkitImageSmoothingEnabled = false;
    picRectCtx.msImageSmoothingEnabled = false;

    zoom.width = zoomW;
    zoom.height = zoomH;
    zoomctx.imageSmoothingEnabled = false;
    zoomctx.mozImageSmoothingEnabled = false;
    zoomctx.webkitImageSmoothingEnabled = false;
    zoomctx.msImageSmoothingEnabled = false;

    ctx.fillStyle = "#fcfcfc";
    ctx.fillRect(0, 0, scaleX, scaleY);
    zoomctx.fillStyle="#393d5c";
    zoomctx.font = "48px serif";
    zoomctx.fillText('正在加载...',80,80);
    $.miniNoty("画布信息--正在加载","normal");
}

$.get('http://'+serverUrl+'/Index/index/getInfo', function (picInfo) {
    var info=JSON.parse(picInfo);
    var h=info['height'];
    var w=info['width'];
    if(!UorNorE(h)&&!UorNorE(w)){
        scaleX=w;
        scaleY=h;
        init();
        initGrid();
    }else{
        $.miniNoty("<strong>画布信息--载入失败,可能是由于网络不稳定或服务器出现未知故障</strong>","error");
    }
    $.get('http://'+serverUrl+'/Index/index/getPic', function (dataStr) {
        var data = parsePic(dataStr);
        for (var index in data) {
            var pixelData = ctx.createImageData(1, 1);
            var d = data[index].split(',');
            var co = toRGB(d[2]);
            co.push(256);
            pixelData.data[0] = co[0];
            pixelData.data[1] = co[1];
            pixelData.data[2] = co[2];
            pixelData.data[3] = co[3];
            ctx.putImageData(pixelData, d[0], d[1]);
        }
        refresh(zoomX, zoomY, zoomW, zoomH);
        $.miniNoty("<strong>画布信息--载入完成</strong>","success");
    });
});

/**
 * @return {boolean}
 */
function UorNorE(obj) {
    return (obj===undefined||obj===null||obj==='');
}

function parsePic(str) {
    return str.split(':');

}
function getX(event) {
    return parseInt((event.layerX + zoomX*scale ) / scale);
}
function getY(event) {
    return parseInt((event.layerY+ zoomY*scale) / scale);
}
function draw(event) {
    //inPink();
    switch(event.button){
        case 0://left
            drLeft();
            break;
        case 1://middle
            drMid();
            break;
        case 2://right
            drRight();
            break;
        default:

    }
    function drLeft() {
        var color = getColorStr().substring(1);
        var con = {x: getX(event), y: getY(event), color: toRGB(color)};
        var pixel = ctx.getImageData(con.x, con.y, 1, 1);
        var ordata = pixel.data;
        var pixelData = ctx.createImageData(1, 1);
        pixelData.data[0] = con.color[0];
        pixelData.data[1] = con.color[1];
        pixelData.data[2] = con.color[2];
        pixelData.data[3] = 80;
        ctx.putImageData(pixelData, con.x, con.y);
        refresh(con.x, con.y, 1, 1);
        $.post('http://'+serverUrl+'/Index/index/drawPixel', {x: con.x, y: con.y, color: color}, function (redata) {
            var data = JSON.parse(redata);
            if (data['err'] === 0) {
                pixelData = ctx.createImageData(1, 1);
                pixelData.data[0] = con.color[0];
                pixelData.data[1] = con.color[1];
                pixelData.data[2] = con.color[2];
                pixelData.data[3] = 255;
                ctx.putImageData(pixelData, con.x, con.y);
                refresh(con.x, con.y, 1, 1);
            } else {
                pixelData = ctx.createImageData(1, 1);
                pixelData.data[0] = ordata[0];
                pixelData.data[1] = ordata[1];
                pixelData.data[2] = ordata[2];
                pixelData.data[3] = ordata[3];
                ctx.putImageData(pixelData, con.x, con.y);
                refresh(con.x, con.y, 1, 1);
                switch (data['err']){
                    case -1:
                        $.miniNoty("<strong>不支持的像素色彩信息,无法绘制像素</strong>","error");
                        break;
                    case -2:
                        $.miniNoty("<strong>非预期请求,无法绘制像素</strong>","error");
                        break;
                    case -3:
                        $.miniNoty("<strong>超出绘制区域,无法绘制像素</strong>","warning");
                        break;
                    case -4:
                        $.miniNoty("<strong>绘制时间限制,还不能绘制新像素</strong>","warning");
                        break;
                }
            }

        });
    }
    function drMid() {

    }
    function drRight() {
        var x = getX(event);
        var y = getY(event);
        var pixel = ctx.getImageData(x, y, 1, 1);
        var data = pixel.data;
        var rgba = 'rgba(' + data[0] + ',' + data[1] +
            ',' + data[2] + ',' + data[3] + ')';
        color.style.background = rgba;
        $("#full").spectrum("set", rgba);
        //color.textContent = rgba;
    }
}
$('canvas').mousedown(function(e){if(e.button===1)return false}).contextmenu(function (e) {
    return false;
});
function downloadPic() {
    this.href=canvas.toDataURL('image/png');
}
function refresh(x, y, w, h) {
    zoomctx.drawImage(canvas,
        x,
        y,
        w, h,
        x * scale, y * scale,
        w * scale, h * scale);
}

function initGrid(){
    var gridScale=16;
    grid.width = scaleX*gridScale;
    grid.height = scaleY*gridScale;
    gridctx.imageSmoothingEnabled = false;
    gridctx.mozImageSmoothingEnabled = false;
    gridctx.webkitImageSmoothingEnabled = false;
    gridctx.msImageSmoothingEnabled = false;
    let m,n;
    gridctx.clearRect(0,0,zoomW,zoomH);
    gridctx.strokeStyle='rgba(229,229,229,0.6)';
    gridctx.strokeWidth=1;
    gridctx.beginPath();
    for( m=1;m<scaleY*gridScale;m++){
        gridctx.moveTo(0,m*gridScale);
        gridctx.lineTo(scaleX*gridScale,m*gridScale);
    }
    for( n=1;n<scaleX*gridScale;n++){
        gridctx.moveTo(n*gridScale,0);
        gridctx.lineTo(n*gridScale,scaleY*gridScale);
    }
    gridctx.stroke();
}
function drawGrid() {
    if(!gridShow.checked)return;
    zoomctx.drawImage(grid,
        zoomX*16,
        zoomY*16,
        zoomW/scale*16, zoomH/scale*16,
        0, 0,
        zoomW, zoomH);
}
function refresh() {
    zoomctx.fillStyle = '#e5e5e5';
    zoomctx.fillRect(0, 0, zoomW, zoomH);
    zoomctx.drawImage(canvas,
        zoomX,
        zoomY,
        zoomW / scale, zoomH / scale,
        0, 0,
        zoomW, zoomH);
    drawGrid();
}
function changeScale(sc){
    if(sc<1)sc=1;
    if(sc>32)sc=32;
    scaleN.innerHTML=Number(sc).toFixed(1);
    //initGrid();
    zoomX+=(zoomW / scale-zoomW/sc)/2;
    zoomY+= (zoomH / scale-zoomH/sc)/2;
    scale=sc;
    refresh();
    refreshRect();
    //gridShow.checked=false;
}
rectX = 0, rectY = 0;
away=false;
function willDraw(event) {

    var x = getX(event);
    var y = getY(event);
    offsetX=event.layerX/scale-x;
    offsetY=event.layerY/scale-y;
    let zx=-event.layerX/scale + picMouseDownPos.x;
    let zy=-event.layerY/scale + picMouseDownPos.y;
    if(!away){
        if(Math.abs(zx)<zoomH/1800)
            zx=0;
        if(Math.abs(zy)<zoomH/1800)
            zy=0;
        if(zx!==0||zy!==0){
            picMouseMove=true;
        }
    }
    if(picMouseLeft===true){

    }else if(picMouseDown===true){
        let zx=-event.layerX/scale + picMouseDownPos.x;
        let zy=-event.layerY/scale + picMouseDownPos.y;
        if(!away){
            if(Math.abs(zx)<zoomH/2000)
                zx=0;
            if(Math.abs(zy)<zoomH/2000)
                zy=0;
            if(zx!==0||zy!==0){
                away=true;
            }
        }
        zoomX = zx + picMouseDownPos.zoomX;
        zoomY = zy + picMouseDownPos.zoomY;
        refresh();
        refreshRect();
        picMouseDownPos.skip++;
        let time=new Date().getTime();
        if(picMouseDownPos.skip>5||time-picMouseDownPos.time>5){
            let a=picMouseDownPos.oldx - event.layerX;
            let b=picMouseDownPos.oldy - event.layerY;
            if(Math.abs(a)<zoomW/500){
                a=0;
            }
            if(Math.abs(b)<zoomH/500){
                b=0;
            }
            picMouseDownPos.vx= a/(time-picMouseDownPos.time);
            picMouseDownPos.vy= b/(time-picMouseDownPos.time);
            picMouseDownPos.time=time;
            picMouseDownPos.oldx=event.layerX;
            picMouseDownPos.oldy = event.layerY;
            picMouseDownPos.skip=0;
        }
    }else{
        if (rectX !== x || rectY !== y) {
            picMouseMove=true;
            zoomctx.fillStyle = '#e5e5e5';
            zoomctx.fillRect((x - 50) * scale, (y - 50) * scale, 100 * scale, 100 * scale);
            refresh(x - 50, y - 50, 100, 100);
            zoomctx.beginPath();
            zoomctx.strokeStyle = getColorStr();
            zoomctx.lineWidth = 2;
            zoomctx.rect((x) * scale-zoomX*scale, (y) * scale-zoomY*scale, 1 * scale, 1 * scale);
            zoomctx.stroke();
        }
    }
}
function refreshRect() {
    picRectCtx.clearRect(0, 0, 200, 200);
    picRectCtx.beginPath();
    picRectCtx.strokeStyle = "#e5434f";
    picRectCtx.lineWidth = 2;
    var w = zoomW / scale / showScale;
    var h = zoomH / scale / showScale;
    picRectCtx.rect(zoomX / showScale, zoomY / showScale, w, h);
    picRectCtx.stroke();
}
function move(x,y) {
    zoomX += x;
    zoomY+=y;
    refresh();
}
function toRGB(str) {
    var c = str.match(/[0-9a-fA-F]{2}/g, 3);
    var co = [];
    for (var rgb in c) {
        co.push(parseInt(c[rgb], 16))
    }
    return co;
}
function toStr(rgb) {
    var str = '';
    for (var s in rgb) {
        var tmp = rgb[s].toString(16);
        str += tmp.length < 2 ? '0' + tmp : tmp;
    }
    return str;
}
function getColorStr() {
    return $('#full').val();
}
function pick(event) {
    var x = getX(event);
    var y = getY(event);
    var pixel = ctx.getImageData(x, y, 1, 1);
    var data = pixel.data;
    var rgba = 'rgba(' + data[0] + ',' + data[1] +
        ',' + data[2] + ',' + data[3] + ')';
    color.style.background = rgba;
    $("#full").spectrum("set", rgba);
    //color.textContent = rgba;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
var reckMouseDown = false;
var picMouseDown = false;
var picMouseLeft=false;
var picMouseMove=false;
var picMouseDownPos = {x: 0, y: 0, zoomX: zoomX, zoomY: zoomY,oldx:0,oldy:0,vx:0,vy:0,time:0,timer:-1,skip:0};
function rectMove(event) {
    if (!reckMouseDown)return;
    var pos = getMousePos(picRect, event);
    picRectCtx.clearRect(0, 0, 200, 200);
    picRectCtx.beginPath();
    picRectCtx.strokeStyle = "#e5434f";
    picRectCtx.lineWidth = 2;
    var w = zoomW / scale / showScale;
    var h = zoomH / scale / showScale;
    picRectCtx.rect((pos.x) - w / 2, (pos.y) - h / 2, w, h);
    picRectCtx.stroke();
    zoomX = parseInt(((pos.x) - w / 2) * showScale);
    zoomY = parseInt(((pos.y) - h / 2) * showScale);
    refresh()
}
$('#downloadPic').on('click',function (event) {
    down.width = scaleX*scale;
    down.height = scaleY*scale;
    downCtx.imageSmoothingEnabled = false;
    downCtx.mozImageSmoothingEnabled = false;
    downCtx.webkitImageSmoothingEnabled = false;
    downCtx.msImageSmoothingEnabled = false;
    downCtx.drawImage(canvas,
        0,
        0,
        scaleX, scaleY,
        0, 0,
        scaleX * scale, scaleY * scale);
    $('#downloadPic').attr('href',down.toDataURL('image/png'));
});
picRect.addEventListener('mousedown', function (event) {
    reckMouseDown = true;
    rectMove(event);
});
picRect.addEventListener('mouseup', function (event) {
    reckMouseDown = false;
});
$(picRect).on('mouseenter', function (event) {
    reckMouseDown = false;
});
zoom.addEventListener('mousedown', function (event) {
    clearInterval(picMouseDownPos.timer);
    //picMouseDownPos = {x: 0, y: 0, zoomX: zoomX, zoomY: zoomY,oldx:0,oldy:0,vx:0,vy:0,time:0,timer:-1,skip:0};
    picMouseDown = event.button===2;

    picMouseLeft=event.button===0;


    picMouseMove =false;
    away=false;
    picMouseDownPos.skip=0;
    picMouseDownPos.x = event.layerX/scale;
    picMouseDownPos.y = event.layerY/scale;
    picMouseDownPos.oldx=event.layerX;
    picMouseDownPos.oldy=event.layerY;
    picMouseDownPos.vx=0;
    picMouseDownPos.vy=0;
    picMouseDownPos.zoomX = zoomX;
    picMouseDownPos.zoomY = zoomY;
    picMouseDownPos.time=new Date().getTime();
},false);
zoom.addEventListener('mouseup', function (event) {
    if(picMouseDown){
        picMouseDown = false;
        away=false;
        let x=getX(event) - zoomX;
        let y = getY(event) - zoomY;
        if(!picMouseMove){
            pick(event);
        }else{
            if(Math.abs( picMouseDownPos.vx)+Math.abs(picMouseDownPos.vy)<0.001)return;
            picMouseDownPos.vx=picMouseDownPos.vx>3?3:picMouseDownPos.vx;
            picMouseDownPos.vy=picMouseDownPos.vy>3?3:picMouseDownPos.vy;
            picMouseDownPos.vx=picMouseDownPos.vx<-3?-3:picMouseDownPos.vx;
            picMouseDownPos.vy=picMouseDownPos.vy<-3?-3:picMouseDownPos.vy;
            picMouseDownPos.timer=setInterval(function () {
                zoomX+=picMouseDownPos.vx*20/scale;
                zoomY+=picMouseDownPos.vy*20/scale;
                picMouseDownPos.vx/=1.2;
                picMouseDownPos.vy/=1.2;
                refresh();
                if(Math.abs( picMouseDownPos.vx)+Math.abs(picMouseDownPos.vy)<0.001){
                    clearInterval(picMouseDownPos.timer);
                }
            },20);
        }
    }else if(picMouseLeft){
        picMouseLeft=false;
        if(!picMouseMove/*||(picMouseDownPos.vx===0&&picMouseDownPos.vy===0)*/){
            draw(event);
        }
    }

},false);
$(zoom).on('mouseenter', function (event) {
    picMouseDown = false;
}).on('mousewheel DOMMouseScroll',function (event, delta) {
    event.preventDefault();
    var value = event.originalEvent.wheelDelta || -event.originalEvent.detail;
    //e.originalEvent.wheelDelta => 120(up) or -120(down) 谷歌IE内核
    //e.originalEvent.detail => -3(up) or 3(down) 火狐内核
    var delta = Math.max(-0.1, Math.min(0.1, value));
    changeScale(scale+scale*delta);
});

picRect.addEventListener('mousemove', rectMove);
//canvas.addEventListener('mousemove', pick);
zoom.addEventListener('mousemove', willDraw,false);
$("#full").spectrum({
    flat: true,
    color: "#000000",
    cancelText: '取消',
    chooseText: '选择',
    togglePaletteMoreText:'更多',
    togglePaletteLessText:'隐藏',
    showButtons: true,
    showInput: true,
    allowEmpty: false,
    showAlpha: false,
    className: "full-spectrum",
    showInitial: true,
    showPalette: true,
    showPaletteOnly: false,
    togglePaletteOnly: true,
    showSelectionPalette: true,
    maxSelectionSize: 8,
    preferredFormat: "hex",
    localStorageKey: "spectrum.pic",
    move: function (color) {
    },
    show: function () {

    },
    beforeShow: function () {

    },
    hide: function () {

    },
    change: function (col) {
        color.style.background = col;
    },
    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
            "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ]
});
