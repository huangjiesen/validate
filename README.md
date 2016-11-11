# 表单验证框插件
[在线演示](http://jiesenboor.github.io/other/demo/validate/index.html) 
   
###简介：
- 这是基于`jquery`的表单验证框插件,支持验证规则扩展、自定义各验证状态的UI提示。
- 将表单值序列化成json对象

###使用方法：
简单的手机验证框声明、并验证
``` javascript
var isOk = $("[name='phone']").validate("validate",{
    required:true,
    validType:"phone"
});
```
自定义`验证函数`,验证值是否为偶数
``` javascript
$("[name='even']").validate({
    trim:false,
    required:true,
    msg:{
        empty:"请输入偶数",
        invalid:"您输入了一个非偶数值"
    },
    validType:function(value){
        return /^\d+$/.test(value) && (parseInt(value) & 1) === 0;
    },
    onEmpty:function(target,msg){
        console.info(msg.empty);
    },
    onInvalid:function(target,msg){
        target.val("");
        console.info(msg.invalid);
    }
});
```

###验证规则：
验证规则是根据使用需求和验证类型属性来定义的，这些规则已经实现：

- email：匹配E-Mail的正则表达式规则。
- url：匹配URL的正则表达式规则。
- length[0,100]：允许在x到x之间个字符。
- phone：配置11位手机号码。

自定义验证规则，需要重写`$.fn.validate.rules`中定义的验证器函数。例如，定义一个最小长度(`minLength`)的自定义验证：
``` javascript
$.extend($.fn.validate.rules, {
    minLength:function(value,param){
        return value > param;
    }
});
$("[name='username']").validate({
    required:true,
    msg:"用户名至少为6个字符",  //msg也可以指定任意类型
    validType:"minLength[6]", //使用重写的验证规则
    onInvalid:function(target,msg){
        console.info(msg);
    }
});
```

###全局验证框状态样式：
验证框有4种状态：`获取焦点`、`验证匹配`、`验证匹配`及`失去焦点`。本插件默认只实现了在验证框失去焦点时对验证框进行验证，如果不希望在失焦时进行验证动作可重写为null，其它三个状态未实现、使用时可通过重写全局的`$.fn.validate.style`实现各种状态的UI提示。
``` javascript
$.extend( $.fn.validate.style,{
    // 验证通过时的验证框处理
    ok:function (target,msg) {
        target.removeClass("warn").addClass("ok");
    },
    // 验证不通过时的验证框处理
    error:function (target,msg) {
        target.removeClass("ok").addClass("warn");
    },
    // 获取焦点时的验证框处理
    focus:function (target,msg) {
        target.removeClass("ok").removeClass("warn")
    }
    ,
    //如果不希望在失焦时进行验证动作可重写为null
    focusout:null
});
```

###属性：
| 属性名     |属性值类型                |描述                                           |默认值|  
| ---------- | ---------- | ---------- | ---------- |
| trim      |boolean                  |是否去掉前值后空格                               |true |
| required  |boolean                  |是否必填                                        |false |
| validType |function,string,string[] |验证类型，可以指定名称或直接指定方法、多个名称时用数组|null |
| msg       |string,string[],object   |消息提示对象。作为第二个参数回传给事件回调函数       |null |

###事件：
| 事件名     | 参数            |  描述  |
| --------- | --------- | --------- |
| onBefore  |target,msg       |在验证一个字段之前触发 |
| onEmpty   |target,msg       |在验证一个字段为空触发 |
| onInvalid |target,msg       |在验证一个字段为不匹配触发 |

###事件：
| 方法名     | 方法属性            |  描述   |
| --------- |--------- |--------- |
| validate  |options             |验证文本框的内容是否有效 |
| destroy   |none                |销毁验证 |   

-----   

###表单值序列化成json对象
```javascript
var jsonObj = $("form").formToJson();
```