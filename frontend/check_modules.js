const http = require('http');
const paths = ['/@vite/client','/src/main.jsx','/src/App.jsx','/src/pages/Home.jsx','/src/pages/Auth.jsx'];
function fetch(p){
  http.get({host:'localhost',port:5173,path:p},res=>{
    let b='';
    res.on('data',c=>b+=c.toString());
    res.on('end',()=>{
      console.log('PATH',p,'STATUS',res.statusCode);
      console.log('PREVIEW:\n',b.slice(0,1000));
      console.log('----');
    });
  }).on('error',e=>console.log('PATH',p,'ERR',e.message));
}
paths.forEach(fetch);
