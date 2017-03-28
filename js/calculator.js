/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function( $ ) {
    $.widget( "custom.calculator", $.custom.baseW,{
        _dialog:null,
        _displayInfo:null,
        _display:null,
        _isOpen:false,
        _drage:false,
        _pointPressed:false,
        _line:[],
        _clearOnNext:true,
        _cleraAllOnNext:true,
        _round:3,
        _hasError:false,
        _mem:null,
        _hardOp:['sqrt','sqr','one/x'],
        _keys:[
            [
                {l:'%',cod:'%'},
                {l:'&#8730;',cod:'sqrt'},
                {l:'x&sup2;',cod:'sqr'},
                {l:'1/x',cod:'one/x'}
            ],
            [
                {l:'CE',cod:'ce'},
                {l:'C',cod:'c'},
                {l:'&lArr;',cod:'del'},
                {l:'&divide;',cod:'/'}
            ],
            [
                {l:'7',cod:'7'},
                {l:'8',cod:'8'},
                {l:'9',cod:'9'},
                {l:'*',cod:'*'}
            ],
            [
                {l:'4',cod:'4'},
                {l:'5',cod:'5'},
                {l:'6',cod:'6'},
                {l:'-',cod:'-'}
            ],
            [
                {l:'1',cod:'1'},
                {l:'2',cod:'2'},
                {l:'3',cod:'3'},
                {l:'+',cod:'+'}
            ],
            [
                {l:'&plusmn;',cod:'plusmn'},
                {l:'0',cod:'0'},
                {l:'.',cod:'.'},
                {l:'=',cod:'='}
            ],
        ],
        getWidgetName:function(){
            return 'calculator';
        },
        _create: function() {
            this.fields={
                top:{message:'Позиция top не заданна ','default':false},
                left:{message:'Позиция left не заданна ','default':false},
            };
            if (this._super()===true){
                this._initall();
            }
        },
        _valHasPoint:function(){
            var tmp=this._getDisplayVal();
            for (var i in tmp){
                if (tmp[i]=='.') return true;
            }
            return false;
        },
        _getPrevSqrVal:function(key){
            var cnt=1;
            if ($.type(this._line[key].count)==='number')
                cnt=this._line[key].count;
            var rVal=this._line[key].val;
            for (i=0;i<cnt;i++){
                switch (this._line[key].cod){
                    case 'sqrt':
                        rVal=Math.sqrt(rVal);
                        break;
                    case 'sqr':
                        rVal*=rVal;
                        break;                        
                    case 'one/x':
                        if (rVal==0){
                            new m_alert('Ошибка','Попытка деления на ноль',true,false);
                            rVal=0;
                            this._hasError=true;
                            this._popFromLine();
                        }else
                            rVal=1/rVal;
                        break;                        
                }
            }
            return rVal;
        },
        _computeAction:function(val1,val2,action){
            var rVal=val1;
            switch (action){
                case'/':
                    if (val2==0){
                        new m_alert('Ошибка','Попытка деления на ноль',true,false);
                        rVal=0;
                        this._hasError=true;
                        this._popFromLine();
                        return false;
                    }
                    rVal/=val2;
                    break;
                case'*':
                    rVal*=val2;
                    break;
                case'-':
                    rVal-=val2;
                    break;
                case'+':
                    rVal+=val2;
                    break;                
            }
            return rVal;
        },
        _computeLine:function(){
            var rVal=0;
            var curr='start';
            var self=this;
            var tmpVal=false;
            $.each(self._line,function(key){
                if ($.inArray(this.val,self._hardOp)===-1){
                    if ($.inArray(this.cod,self._hardOp)===-1)
                        tmpVal=this.val;
                    else{
                        if (key>0&&$.inArray(this.cod,self._hardOp)!==-1&&$.inArray(self._line[key-1].cod,self._hardOp)!==-1){
                            rVal=self._getPrevSqrVal(key);
                            curr=this.cod;
                            return true;
                        }else
                            tmpVal=self._getPrevSqrVal(key);
                    }
                }
                if (!$.isNumeric(tmpVal)&&$.inArray(tmpVal,self._hardOp)!==-1){
                    tmpVal=self._getPrevSqrVal(key-1);
                }else{
                    switch(curr){
                        case 'start':
                            if ($.inArray(this.cod,self._hardOp)===-1){
                                rVal=tmpVal;
                            }else{
                                rVal=self._getPrevSqrVal(key);
                            }
                            break;
                        case'-%':
                        case'+%':
                        case'*%':
                        case'/%':
                            rVal=rVal*tmpVal/100;
                            if (self._line.length>1)
                                self._line[self._line.length-2].cod=curr.substr(0,1);
                            self._popFromLine();
                            break;
                        default:
                            var dop=self._computeAction(rVal,tmpVal,curr);
                            if (dop!==false)
                                rVal=dop;
                            else
                                return false;
                            break;
                    }
                }
                curr=this.cod;
            });
           
            return Math.round((rVal)*10000000000000)/10000000000000;
        },
        _showSqr:function(val,count,html){
            if (count===1){
                return ' '+html+'('+val+') ';
            }else{
                return ' '+html+'('+this._showSqr(val,count-1,html)+') ';
            }
        },
        _showLine:function(){
            var text='';
            var ed;
            var self=this;
            $.each(this._line,function(){
                if (text.length) text+=' ';
                //if (this.cod!=='sqrt') text+=this.val;
                ed=' ';
                //if (this.val!='sqrt'){
                    if ($.inArray(this.val,self._hardOp)===-1&&$.inArray(this.cod,self._hardOp)===-1) text+=this.val;
                    switch(this.cod){
                        case'/':
                            text+=' /'+ed;
                            break;
                        case'*':
                            text+=' *'+ed;
                            break;
                        case'-':
                            text+=' -'+ed;
                            break;
                        case'+':
                            text+=' +'+ed;
                            break;
                        case'sqrt':
                            text+=self._showSqr(this.val,this.count,'&#8730;');
                            break
                        case'sqr':
                            text+=self._showSqr(this.val,this.count,'sqr');
                            break
                        case'one/x':
                            text+=self._showSqr(this.val,this.count,'reciproc');
                            break
                    }
              //  }
            });
            this._setInfo(text);
            return text;
        },
        _parseVal:function(){
            if (this._pointPressed)
                return parseFloat(this._getDisplayVal());
            else
                return parseInt(this._getDisplayVal());
        },
        _getDisplayVal:function(){
            return this._display.children('div').text();
        },
        _setInfo:function(valtmp){
            var val=''+valtmp;

            if (val.length<120){
                this._displayInfo.removeClass('dsm1');
                this._displayInfo.removeClass('dsm2');
            }else{
                if (val.length<200){
                    this._displayInfo.removeClass('dsm2');
                    this._displayInfo.addClass('dsm1');
                }else{
                    this._displayInfo.removeClass('dsm1');
                    this._displayInfo.addClass('dsm2');
                    
                }
            }
            var s=$.fn.creatTag('div',{html:val});
            this._displayInfo.empty().append(s);  
            var d=this._displayInfo.children('div:first-child');
            if (d.height()>this._displayInfo.height()){
                console.log(this._displayInfo,d,d.height(),this._displayInfo.height());
                d.css('margin-top',(this._displayInfo.height()-d.height())+'px');
            }else{
                d.removeAttr('style');
            }

        },
        _setDisplay:function(valtmp){
            var val=''+valtmp;
            if (val.length<12){
                this._display.removeClass('dsm1');
                this._display.removeClass('dsm2');
                this._display.removeClass('dsm3');
            }else{
                if (val.length<18){
                    this._display.removeClass('dsm2');
                    this._display.addClass('dsm1');
                }else{
                    if (val.length<22){
                        this._display.removeClass('dsm1');
                        this._display.addClass('dsm2');
                    }else{
                        this._display.removeClass('dsm2');
                        this._display.addClass('dsm3');
                    }
                }
            }
            var s=$.fn.creatTag('div',{text:val});
            this._display.empty().append(s);
            this._pointPressed=this._valHasPoint();
            this._memUpdateState();
        },
        _addToLine:function(cod){
            var val=this._parseVal();
            console.log(this._line[this._line.length-1]);
            var codp=0;
            if (this._line.length) codp=this._line[this._line.length-1].cod
            if (!this._line.length||$.inArray(codp,this._hardOp)===-1||$.inArray(cod,this._hardOp)===-1||cod!==codp){
                if (this._line.length){
                    if ($.inArray(codp,this._hardOp)!==-1&&$.inArray(cod,this._hardOp)===-1){
                        val=this._line[this._line.length-1].cod;
                    }
                }
                console.log(val);
                this._line[this._line.length]={val:val,cod:cod};
                if ($.inArray(cod,this._hardOp)!==-1) this._line[this._line.length-1].count=1;
                this._clearOnNext=true;
                this._pointPressed=this._valHasPoint();
            }else{
                this._clearOnNext=true;
                this._line[this._line.length-1].count++;
            }
            this._showLine();
            this._setDisplay(this._computeLine());
            if ($.inArray(cod,this._hardOp)!==-1) this._clearAllOnNext=true;
        },
        _popFromLine:function(){
            console.log(this._line);
            if (this._line.length){
                var tmp=this._line.pop();
                console.log(this._hasError);
                if (tmp.cod!=='='){
                    console.log(tmp.cod);
                    this._hasError=false;
                }
            }
            console.log(this._line);
            this._showLine();
            this._setDisplay(this._computeLine());
            this._pointPressed=this._valHasPoint();
        },
        _clear:function(){
            console.log('clear');
            this._setDisplay('0');
            delete (this._line);
            this._line=[];
            this._showLine();
            this._pointPressed=false;
        },
        _initall:function(){
            this.element.click({self:this},function(e){
                e.preventDefault();
                console.debug(e.data.self.createMessageText('openClick'));
                if (e.data.self.isOpen()===false)
                    e.data.self.open();
                else
                    e.data.self.hide();
            });
        },
        _creatHeader:function(){
            var h=$.fn.creatTag('div',{
                'class':'calculator-head'
            });
            h.append($.fn.creatTag('span',{text:'Калькулятор'}));
            var a=$.fn.creatTag('a',{href:'#'});
            a.append($.fn.creatTag('span',{'class':'glyphicon glyphicon-remove'}));
            a.click({self:this},function(e){
                e.preventDefault();
                e.data.self.hide();
            });
            h.append(a);
            return h;
        },
        _setPos:function(pos){
            if ($.type(pos)==='object'){
                if ($.type.left!=='undefined') this.options.left=pos.left;
                if ($.type.top!=='undefined') this.options.top=pos.top;
            }
            this.dialog.offset({left:this.options.left,top:this.options.top});
        },
        _createMemoryBlock:function(){
            var d=$.fn.creatTag('div',{'class':'calculator-memory'});
            //var bg=$.fn.creatTag('div',{'class':'btn-group'});
            d.append($.fn.creatTag('a',{'class':'btn disabled',text:'MC',data:'MC'}));
            d.append($.fn.creatTag('a',{'class':'btn disabled',text:'MR',data:'MR'}));
            d.append($.fn.creatTag('a',{'class':'btn',text:'M+',data:'M+'}));
            d.append($.fn.creatTag('a',{'class':'btn',text:'M-',data:'M-'}));
            d.append($.fn.creatTag('a',{'class':'btn',text:'MS',data:'MS'}));
            d.find('a').click({self:this},this._memPress);
            return d;
        },
        _processKey:function(dt){
            var val=this._getDisplayVal();
            if (this._clearOnNext){
                val='0';
                this._clearOnNext=false;
            }
            if (this._clearAllOnNext){
                this._clearAllOnNext=false;
                switch(dt){
                    case '/':
                    case '*':
                    case '-':
                    case '+':
                    case '=':
                    case 'sqrt':
                    case 'sqr':
                    case 'one/x':
                    case 'del':
                        break;
                    default:
                        this._clear();
                        break
                }
            }
            if (dt.charCodeAt(0)>47&&dt.charCodeAt(0)<58){
                if (val.length>11||(dt.charCodeAt(0)==48&&val.charCodeAt(0)==48&&val.length==0)) return;
                if (val!='0')
                    this._setDisplay(val+dt);
                else
                    this._setDisplay(dt);
            }else{
                switch(dt){
                    case 'del':
                        if (this._clearOnNext){
                            val='0';
                            this._clearOnNext=false;
                        }
                        if (val!='0'){
                            if (val.length===1){
                                this._setDisplay('0');
                            }else{
                                if (val.charCodeAt(val.length-1)==46) this._pointPressed=false;
                                this._setDisplay(val.substr(0,val.length-1));
                                val=this._display.children('div').text();
                                if (val.length===1&&val.charCodeAt(0)===45)
                                    this._setDisplay(0);
                            }
                        }
                        break;
                    case '.':
                        if (this._clearOnNext){
                            val='0';
                            this._clearOnNext=false;
                        }
                        if (this._pointPressed) break;
                        this._setDisplay(val+'.');
                        this._pointPressed=true;
                        break;
                    case '/':
                    case '*':
                    case '-':
                    case '+':
                    case 'sqrt':
                    case 'sqr':
                    case 'one/x':
                        this._addToLine(dt);
                        break;
                    case 'c':
                        this._clear.call(this);
                        break;
                    case '=':
                        console.log(this);
                        this._addToLine('=');
                        if (!this._hasError){
                            delete this._line;
                            this._line=[];
                            this._showLine();
                            this._pointPressed=this._valHasPoint();
                        }else{
                            this._hasError=false;
                        }
                        break;
                    case 'plusmn':
                        this._setDisplay(this._getDisplayVal()*-1);
                        break;
                    case 'ce':
                        if (this._line.length)
                            this._popFromLine();
                        break;
                    case '%':
                        if (this._line.length){
                            this._line[this._line.length-1].cod=this._line[this._line.length-1].cod+'%';
                            this._addToLine('=');
                        }
                        break;
                        //sqrt
                }
            }
        },
        _createButtonBlock:function(){
            var div=$.fn.creatTag('div',{'class':'calculator-keyboard'});
            var d=$.fn.creatTag('table',{});
            var self=this;
            $.each(this._keys,function(){
                var r=$.fn.creatTag('tr',{});
                $.each(this,function(){
                    var a=$.fn.creatTag('a',{'class':'btn',html:this.l,role:'calckey',data:this.cod});
                    var td=$.fn.creatTag('td',{});
                    a.click(function(e){
                        var dt=$(this).attr('data');
                        if ($.type(dt)==='string'){
                            self._processKey(dt);
                        }
                    });
                    td.append(a);
                    r.append(td);
                });
                d.append(r);
            });
            div.append(d);
            return div;
        },
        _memUpdateState:function(){
            var cont=this._display.children('span');
            if (this._mem!==null){
                if (!cont.length){
                    cont=$.fn.creatTag('span',{text:'M'});
                    var d=this._display.children('div:first-child');
                    if (d.length)
                        d.before(cont);
                    else
                        this._display.append(cont);
                }
                    cont.attr('title',this._mem);
            }else{
                if (cont.length) cont.remove();
            }
        },
        _memCreate:function(){
            this.dialog.find('.calculator-memory').children().removeClass('disabled');
            this._mem=0;
        },
        _memClear:function(){
          //&:nth-child(1);
          var m=this.dialog.find('.calculator-memory');
          m.children(':nth-child(1)').addClass('disabled');
          m.children(':nth-child(2)').addClass('disabled');
          this._mem=null;
          this._memUpdateState();
        },
        _memPress:function(e){
            var self=e.data.self;
            switch($(this).attr('data')){
                case 'M+':
                    if (self._mem===null) self._memCreate();
                    self._mem+=self._parseVal();
                    self._memUpdateState();
                    break;
                case 'M-':
                    if (self._mem===null) self._memCreate();
                    self._mem-=self._parseVal();
                    self._memUpdateState();
                    break;
                case 'MS':
                    if (self._mem===null) self._memCreate();
                    self._mem=self._parseVal();
                    self._memUpdateState();
                    break;
                case 'MC':
                    self._memClear();
                    break;
                case 'MR':
                    if (self._mem!==null){
                        self._setDisplay(self._mem);
                        self._clearOnNext=true;
                    }
                    break;
            }
        },
        _createDialog:function(){
            var d=$.fn.creatTag('div',{
                'class':'m-calculator',
                tabindex:200
            });
            d.append(this._creatHeader());
            $('body').append(d);
            d.offset({left:this.options.left,top:this.options.top});
            $(d).draggable({
                handle:'.calculator-head'
            });
            this._displayInfo=$.fn.creatTag('div',{'class':'calculator-display-info'});
            d.append(this._displayInfo);
            this._display=$.fn.creatTag('div',{'class':'calculator-display'});
            d.append(this._display);
            d.append(this._createMemoryBlock());
            d.append(this._createButtonBlock());
            d.focusin(function(){
                console.debug('fin');
                $(this).addClass('m-calculator-focus');
            });
            d.focusout(function(){
                console.debug('fout');
                $(this).removeClass('m-calculator-focus');
            });
            d.keypress({self:this},this._keyPress);
            this.dialog=d;
            return d;
        },
        _keyPress:function(e){
            console.log(e.key+' cod: '+e.keyCode);
            if (e.keyCode==13)
                e.data.self._processKey('=');
            else
                e.data.self._processKey(e.key);
        },
        isOpen:function(){return this._isOpen;},
        hide:function(){
            this.dialog.css('display','none');
            this._isOpen=false;            
        },
        open:function(){
            if (this.options.top===false){
                this.options.top=($(window).height()-400)/2;
            }
            if (this.options.left===false){
                this.options.left=($(window).width()-300)/2;
            }
            if (this.dialog===null){
                this.dialog=this._createDialog();
                this._setDisplay(0);
            }
            
            this.dialog.css('display','block');
            this._isOpen=true;
        }
    });
}( jQuery ) );
