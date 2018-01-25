const rq = require('request')
const http = require('http')
const config = require('./config')
const url = require('url')
const queryString = require('querystring')
const path = require('path')
const fs = require('fs')

http.createServer(async function(req,res){
    try {
        // 获取传入的url
        let query = url.parse(req.url).query
        // 得到解析的query字符串,只使用url
        let link = queryString.parse(query).url
        // 如果url不存在返回404,并返回提示信息
        if(!link){  
            fs.createReadStream('./index.html').pipe(res)
            return
        }
        // 解析传入的url
        let linkUrl = url.parse(link)
        // 如果传入的参数不正确,则一样返回如下信息
        if(!linkUrl.protocol){
            res.writeHead(404)
            res.end(`
                url 参数是必须的,正确的格式是 : https://xxxx.com/?url=yoururl
                <br/>
                Please input url as : http://xxxx.com/?url=yoururl . And url is require.  
            `)
            return
        }
        // 正确则解析url的后缀,没有后缀则默认打开页面
        let extname = path.extname(linkUrl.path)
        // 如果后缀存在,则视为文件予以下载
        if(extname!='.'&&extname!=''){
            let name = path.basename(link)
            res.setHeader("Content-Disposition",`attachment; filename="${name}"`)
        }
        // 使用request流式传输数据
        rq.get(link).pipe(res)
    }
    catch (err) {
        // 当意外错误发生时,记录信息
        console.log(err.message)
        // 并当错误信息存在时返回错误信息(不包含文件信息)
        if(err){
            res.end(err.message)
        }
    }
}).listen(config.port,function(){
    console.info(`Server is running at : ${config.port}`)
})
