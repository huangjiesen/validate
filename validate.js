(function($){
    /**
     * 执行校验规则对表单值进行校验
     * @param value 表单值
     * @param rule 校验规则类型
     * @returns {*} 校验通过返回true、失败返回false。找不到校验规则类型则抛出异常
     */
    var execute = function (value,rule) {
        //
        // 判断校验规则类型是否参数,则截取参数
        // 例如:
        //     length[5,10]
        // 校验规则类型为:length
        // 校验规则类型参数为:[5,10]
        //
        var index = rule.indexOf("[");
        var paramArr;
        if(index>0) {
            paramArr = rule.substring(index+1,rule.length-1).split(",");
            rule = rule.substr(0, index);
        }

        var method = $.fn.validate.rules[rule];
        if(method) {
            // 调用校验方法，如果验证类型没有参数paramArr为undefined
            return method(value,paramArr);
        }else{
            // 如果找不到校验规则、则抛出异常
            throw new Error("没有发现校验规则：" + rule);
        }
    };

    /**
     * 表单验证
     * @param obj 要验证的表彰
     * @returns {boolean} 验证通过返回
     */
    var validate = function (obj) {
        //获取当前表单校验规则
        var rule=obj.data("rule");
        //校验前回调
        rule.onBefore && rule.onBefore(obj,rule.msg);

        var value=obj.val();
        //否则去掉表单值的前后空格
        if(rule.trim) {
            obj.val(value = $.trim(value));
        }

        //非空校验
        if(value == "") {
            if(rule.required) {
                //校验失败的回调
                rule.onEmpty && rule.onEmpty(obj,rule.msg);
                rule.isEmpty=true;
                return false;
            }
            return true;
        }

        rule.isEmpty=false;
        //如果指定了校验类型、则进行校验
        if(rule.validType) {
            //变量声明：校验类型、校验是否通过、当前执行校验的类型
            var type = rule.validType,isOk,validType=undefined;

            //
            // 判断指定校验类型的方式，validType字符串、方法、字符串类型的数组
            //
            switch(typeof type){
                case "function":    //如果是方法直接传递值执行
                    isOk = type(value);
                    break;
                case "string":      //如果是字符串校验名称、则调用执行
                    isOk = execute(value,type);
                    break;
                default:
                    if(type instanceof Array) {
                        //如果是校验类型数组、则遍历执行
                        $.each(type, function (i,n) {
                            if(!(isOk = execute(value,n))) {
                                // 如果校验不通过、则结束校验记录当前执行的校验类型
                                validType = n;
                                return false;
                            }
                        });
                    }else{
                        throw new Error("校验类型validType的参数值不正确，请指定字符串类型的规则名称或直接指定校验函数，需传多个规则名称可用数组方式");
                    }
            }
            if(!isOk) {
                // 如果指定了校验不通过的回调则执行
                rule.onInvalid && rule.onInvalid(obj,rule.msg,validType);
                return false;
            }
        }
        //默认返回true
        return true;
    };


    /**
     * 给表单元素绑定规则
     * @param obj
     * @param rule
     */
    var bindRule = function (obj,rule) {
        obj.data("rule", rule);
        unBind(obj);
        obj.bind("focus",function () {
            $.fn.validate.style.focus(obj,rule.msg);
        });
        if($.fn.validate.style.focusout) {
            obj.bind("focusout",function () {
                $.fn.validate.style.focusout(obj,rule.msg);
            });
        }
    };
    /**
     * 解绑验证规则
     * @param target
     */
    var unBind = function (target) {
        target.data("rule",undefined);
        target.unbind("focus", $.fn.validate.style.focus);
        target.unbind("focusout", $.fn.validate.style.focusout);
    };

    /**
     * 创建表单验证
     * @param options 验证参数
     * @returns {*}
     */
    $.fn.validate = function (options) {
        if(typeof options == "string"){
            //如果传入了传入了两个参数、则以为第二个参数是验证规则
            if(arguments.length==2) {
                var opt = this.data("rule") || $.fn.validate.defaults;
                bindRule(this, $.extend({},opt,arguments[1]));
            }

            //执行方法
            var method = $.fn.validate.method[options];
            if(method) {
                return method(this);
            }else{
                throw new Error("方法："+options+"未定义。可调用方法有(validate|destroy)");
            }
        }

        // 如果传入的第一个参数不是字符串、则以为是创始验证对象
        options = options || {};
        bindRule(this, $.extend({},$.fn.validate.defaults,options));
        return this;
    };

    /**
     * 表单验证默认规则
     * @type {{
     *      名称         类型                      默认值    说明
     *      trim        boolean                   true     是否去掉前后空格。默认为true
     *      required    boolean                   false    是否必填
     *      validType   function,string,string[]  null     验证类型，可以指定名称或直接指定方法、多个名称时用数组
     *      msg         string,object,string[]    null     消息提示对象。作为第二个参数回传给事件回调函数
     *      onBefore    function                  null     执行表单值验证前的回调函数
     *      onEmpty     function                  null     验证表单值验证为空时的回调函数
     *      onInvalid   function                  null     验证表单值验证无效时的回调函数
     *  }}
     */
    $.fn.validate.defaults = {
        trim:true,
        required:false,
        validType:null,
        msg:null,
        onBefore:null,
        onEmpty:null,
        onInvalid:null
    };

    /**
     *
     * @type {{validate: $.fn.validate.method.validate, isValid: $.fn.validate.method.isValid, destroy: $.fn.validate.method.destroy}}
     */
    $.fn.validate.method = {
        validate:function (obj) {
            var rule = obj.data("rule");
            if(validate(obj)) {
                //执行显示校验成功的样式处理方法
                $.fn.validate.style.ok(obj,rule.msg);
                return true;
            }
            //执行显示校验失败的样式处理方法
            $.fn.validate.style.error(obj,rule.msg,rule.isEmpty);
            return false;
        },
        destroy:unBind
    };

    /**
     * 表单验证的全局样式。
     * 扩展方式：
     *      $.extend($.fn.validate.style,{});
     * @type {{ok: $.fn.validate.style.ok, error: $.fn.validate.style.error, focus: $.fn.validate.style.focus}}
     */
    $.fn.validate.style = {
        ok:function () {},
        error:function () {},
        focus:function () {},
        focusout:function (obj) {
            $.fn.validate.method.validate(obj);
        }
    };

    /**
     * 验证规则
     * @type {{phone: $.fn.validate.rules.phone}}
     */
    $.fn.validate.rules = {
        phone:function (value) {
            return /^1(3|4|5|7|8)\d{9}$/.test(value);
        },
        email:function (value) {
            return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(value);
        },
        url:function (value) {
            return /^https?:\/\/([\dA-Za-z\.-]+)\.([A-Za-z\.]{2,6})([\/\w \.-]*)*\/?(\?.+)?$/.test(value);
        },
        length:function(value,param){
            return value.length >= param[0] && value.length <= param[1];
        }
    };

    /**
     * 将表单值序列化成对象
     * @returns {{}}
     */
    $.fn.formToJson = function () {
        if(!this.is("form")) {
            throw new Error("当前元素非form表单元素");
        }
        var obj = {};
        $.each(this.serializeArray(), function() {
            if (obj[this['name']]) {
                obj[this['name']] = obj[this['name']] + "," + this['value'];
            } else {
                obj[this['name']] = this['value'];
            }
        });
        return obj;
    };
})(jQuery);

