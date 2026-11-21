const {execFileSync}=require('node:child_process');const fs=require('node:fs');
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','*.js','*.cjs'],{encoding:'utf8'}).trim().split(/\r?\n/);for(const file of files)execFileSync(process.execPath,['--check',file]);
const html=fs.readFileSync('dating-god/assets/index.html','utf8');for(const [,name]of html.matchAll(/(?:src|href)="([^\"]+)"/g))if(!fs.existsSync('dating-god/assets/'+name))throw Error('Missing asset: '+name);
console.log('Syntax and asset contracts passed');
