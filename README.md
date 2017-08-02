2017/08/02更新：parse方法改成使用词法分析器，而不是正则表达式。几乎重写了其他东西。
  
  

本想留一个工具库，后来看了angularjs的一部分源码，有了模仿写一个mvc的打算，然后就有了这个mvc.js。    
除了angularjs的scope, directive外，里面封装了一些常用的方法: extend, forEach, reduce, on, off, http, promise等。    

on, off事件绑定模仿了jq事件的代理模式;    
promise大量参照了angularjs源码的$q服务,用法与$q一样;    
MVC数据绑定使用的是angularjs类似的watch, dirgest脏检查机制，指令部分也是参照了angularjs源码的指令服务: compile, preLink, postLink, {{}}等.    


html:  

    <div id="div">
      <p @click="add($event,this)">{{ a[0] }} .... {{ b }}</p>    
      <p :show = "c">{{ d(a[1], b) }}</p>
      <p my-dir></p>
      <p><input type="text" :text="b">{{b}}</p>    
      <p id="p"></p>
    </div>
   
js:  

    var m = new $.MVC({
      el : "#div",
      controller : function(node){
        this.a = [10, 11, 12]
        this.b = 2;
        this.c = false;
        this.d = function(a, b){ return a + b;};
        this.add = function(){ console.log(arguments); this.c = !this.c;};
      },
      directives : {
        'my-dir' : {
          scope : true,
          template : '<span>{{b}}</span>',
          compile : function(node){
            return {
              pre : function(node, model){ console.log('pre:', arguments); },
              post : function(node, model){ console.log('post:', arguments); model.a = 100;}
            };
          }
        }
      }
    }); 
    $('#p').appendChild(m.$compile('<span>{{b}}</span>'))

    setTimeout(function(){
      m.$model.b = 99;
      m.$apply();
    }, 2000);
       

        
预览：https://fengc789.github.io/mvc-lib/    
2017年1月24日    
2058029557@qq.com    
