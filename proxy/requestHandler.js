var http = require('http')
	querystring = require('querystring')
	url = require('url')

let opt = {
	hostname: 'mt.qdxiao2.com'
	// hostname: '192.168.1.103',
	// port: '8080'
}

const getParamHandler = param => {
	let baseStr = '?'
	for(let i in param){
		baseStr += `${i}=${param[i]}&`
	}
	return param === {} ? '' : baseStr
}
const postParamHandler = param => {
	let baseStr = ''
	for(let i in param){
		baseStr += `/${param[i]}`
	}
	return baseStr
}

exports.proxy = (res, param, header) => new Promise((reslove, reject) => {
	let body = '',
		req,
		method = param.type,
		path = param.path
	req = http.request(Object.assign({}, opt, { method, path }, { headers:{ 'Content-Type': 'application/x-www-form-urlencoded' } } ), res => {
			console.log("Got response: " + res.statusCode)
			res.on('data', d => {
			  	body += d
			}).on('end', _ => {
			  	reslove(body)
			})
		}).on('error', e => {
		  console.log("Got error: " + e.message)
		})
	method == 'post' ? req.write( querystring.stringify( JSON.parse(param.param) ) ) : null
	req.end()
}).then(body => {
    res.writeHead(200, {"Content-type": "text/plain"})
    res.write(body)
	res.end()
})







