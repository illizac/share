import '../css/main.css'

const IsWeixinOrAlipay =  _ => {
	let userAgent = navigator.userAgent.toLowerCase()
	return userAgent.match(/MicroMessenger/i) == "micromessenger" ? true : false
}

// const baseUrl = "http://mt.qdxiao2.com"
const baseUrl = 'http://m.zanzanmd.cn'

const dlb = {
    byName: name => document.getElementsByName(name),
    byId: id => document.getElementById(id),
    byQs: ele => document.querySelector(ele),
    byQsa: eles => document.querySelectorAll(eles),
    show: obj => obj.style.display = 'block',
    hide: obj => obj.style.display = 'none',
    isNumeric: num => !!Number(num),
    //判断是否是整数
    isInt: num => num % 1 == 0 ? parseInt(num) : Number(num).toFixed(1),
    //事件监听
    addEvent: (obj, sEv, fn) => obj.addEventListener ? obj.addEventListener(sEv, fn, false) : obj.attachEvent('on' + sEv, fn),
    removeEvent: (obj, sEv, fn) => obj.removeEventListener ? obj.removeEventListener(sEv, fn, false) : obj.detachEvent('on' + sEv, fn),
    //增加className
    addClass: (obj, sClass) => {
        if (obj.className) {
            var reg = new RegExp('\\b' + sClass + '\\b', 'g')
            if (obj.className.search(reg) == -1) {
                obj.className += ' ' + sClass
            }
        } else {
            obj.className = sClass
        }
    },
    //删除className
    removeClass: (obj, sClass) => {
        if (obj.className) {
            var reg = new RegExp('\\b' + sClass + '\\b', 'g')
            if (obj.className.search(reg) != -1) {
                obj.className = obj.className.replace(reg, '').replace(/^\s+|\s+$/, ' ').replace(/\s+/g, ' ')
                if (!obj.className) {
                    obj.removeAttribute("class")
                }
            }
        }
    },
    //查看是否有这个class名，有就返回true否则返回false
    hasClass: (obj, cls) => {
        var obj_class = obj.className,              //获取 class 内容.
            obj_class_lst = obj_class.split(/\s+/)     //通过split空字符将cls转换成数组.
        var x = 0
        for (x in obj_class_lst) {
            if (obj_class_lst[x] == cls) {          //循环数组, 判断是否包含cls
                return true
            }
        }
        return false
    },
    //清除所有iclass
    clear: (item, iclass) => {
        for(let i in item)
            dlb.removeClass(item[i], iclass)
    },
    //ajax函数 封装
    json2url: json => {
        let arr = []
        for (let name in json) {
            arr.push(name + '=' + encodeURIComponent(json[name]))
        }
        return arr.join('&')
    },
    // data, type, timeout, url, success, error
    ajax: json => {
        var timer = null
        json = json || {}
        if (!json.url)return
        json.data = json.data || {}
        json.type = json.type || 'get'
        json.timeout = json.timeout || 8000

        if (window.XMLHttpRequest) {
            var oAjax = new XMLHttpRequest()
        } else {
            var oAjax = new ActiveXObject('Microsoft.XMLHTTP')
        }
        switch (json.type.toLowerCase()) {
            case 'get':
                oAjax.open('GET', json.url + '?' + dlb.json2url(json.data), true)
                oAjax.send()
                break
            case 'post':
                oAjax.open('POST', json.url, true)
                oAjax.setRequestHeader('Content-Type', json.header || 'application/x-www-form-urlencoded')
                oAjax.send(json.header ? JSON.stringify(json.data) : dlb.json2url(json.data))
                break
        }
        oAjax.onreadystatechange = function () {
            if (oAjax.readyState == 4) {
                clearTimeout(timer)
                if (oAjax.status >= 200 && oAjax.status < 300 || oAjax.status == 304) {
                    json.success && json.success(oAjax.responseText)
                } else {
                    json.error && json.error(oAjax.status)
                }
            }
            timer = setTimeout(function () {
                if (oAjax.readyState != 4) {
                    clearTimeout(timer)
                    json.error && json.error()
                }
            }, json.timeout)
        }
    },
    jsonp: json => {
        json = json || {}
        if (!json.url)return
        json.cbName = json.cbName || 'cb'
        json.data = json.data || {}

        json.data[json.cbName] = 'show' + Math.random()
        json.data[json.cbName] = json.data[json.cbName].replace('.', '')

        var arr = []
        for (var i in json.data) {
            arr.push(i + '=' + encodeURIComponent(json.data[i]))
        }
        var str = arr.join('&')

        window[json.data[json.cbName]] = function (result) {
            json.success && json.success(result)
            oH.removeChild(oS)
            window[json.data[json.cbName]] = null
        }
        var oH = document.getElementsByTagName('head')[0]
        var oS = document.createElement('script')
        oS.src = json.url + '?' + str
        oH.appendChild(oS)
        oS.onerror = function () {
            window[json.data[json.cbName]] = null
            oH.removeChild(oS)
            json.error && json.error()
        }
    }
}

const Api = (_ => {
	const api = function(){}

	const handleProxyPath = (path, success, param, type) => {
        let obj = {
            url: `${baseUrl}${path}`,
            type,
            data: param,
            success
        }
        return obj
    }

	api.prototype = {
		getCard: param => new Promise((rsl, rej) => {
			dlb.ajax(handleProxyPath(`/api-mt/couponReceive/v1/receive`, data => rsl( JSON.parse(data) ), param, 'post'))
		}),
		checkstate: param => new Promise((rsl, rej) => {
			dlb.ajax(handleProxyPath(`/api-mt/couponReceive/v1/checkReceive`, data => rsl( JSON.parse(data) ), param, 'post'))
		}),
		getCardInfo: param => new Promise((rsl, rej) => {
			dlb.ajax(handleProxyPath(`/api-mt/coupon/v1/getInfo`, data => rsl( JSON.parse(data) ), { id: param }, 'post'))
		})
	}
	return new api()
})()

const showToast = msg => {
    msg = msg || "数据加载中"
    dlb.byId("toast_msg").innerHTML = msg
    dlb.show(dlb.byId("loadingToast"))
}

const hideToast = _ => dlb.hide(dlb.byId("loadingToast"))

const showDialog = title => dlb.show(dlb.byId("mydailg"))

const showToastSuccess = _ => dlb.show(dlb.byId("toastsuccess"))

const hideToastSuccess = _ => dlb.show(dlb.byId("toastsuccess"))




window.onload = function(){
	if(!IsWeixinOrAlipay()){
		dlb.byId('body').innerHTML = `<div style='font-size: .3rem; padding: .1rem'>请在微信上打开</div>`
	}else{
		dlb.byId('wechat').style.display = 'block'

	    let p = {}
	    document.location.search.substring(1, document.location.search.length).split('&').map(val => {
	        let a
	        a = val.split('=')
	        p[a[0]] = a[1]
	    })

	    let param = {
	        cpBatchId: p.cpBatchId,
	        openId: p.openId
	    }

	    const getFunc =  _ => {
	    	showToast('领取中')
	    	Api.getCard( param ).then(data => {

	    		if(data.code == '200'){
	    			showToast('领取成功')
		    		dlb.byId('getBtn').style.background = '#ccc'
		    		dlb.byId('getBtn').innerHTML = '已领取'
		    		dlb.removeEvent( dlb.byId('getBtn'), 'click', getFunc )
	    		}else{
	    			showToast('领取失败')
	    		}

	    		setTimeout(hideToast, 500)
	    	})
	    }

	    Api.getCardInfo(param.cpBatchId).then(data => {
	    	let d = data.data
	    	if(d){
	    		if(d.couponType == '2'){
	    			dlb.byId('fullContainer').style.display = 'none'
	    			dlb.byId('couponType').innerHTML = '红包'
	    			dlb.byId('cpType').innerHTML = '红包'
	    		}

	    		dlb.byId('shopName').innerHTML = d.spShopName
		    	dlb.byId('discountAmount').innerHTML = `<span>¥</span>${d.discountAmount}`
		    	dlb.byId('fullAmount').innerHTML = d.fullAmount
		    	dlb.byId('deadline').innerHTML = d.deadline.split(' ')[0]

		    	if(d.surplusNum == '0'){
		    		dlb.byId('getBtn').style.background = '#ccc'
		    		dlb.byId('getBtn').innerHTML = '已领完'
		    		return false
		    	}
		    	return true

	    	}else{
	    		showToast('获取卡券失败')

	    		return false
	    	}
	    }).then(state => state ? Api.checkstate(param) : 'fail' )
	    .then(data => {
	    	if(data != 'fail'){
	    		if(data.code == '40049'){
					dlb.byId('getBtn').innerHTML = '已领取'
	    		}else if(data.code == '200'){
			    	dlb.byId('getBtn').style.background = 'rgb(204,20,34)'
			    	dlb.addEvent(dlb.byId('getBtn'), 'click', getFunc )
	    		}
	    	}
	    })
	    .then(_ => {
	    	setTimeout(hideToast, 500)
	    })

	}


}







