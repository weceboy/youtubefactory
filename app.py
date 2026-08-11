import json, os, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote

DATA = Path(__file__).with_name("projects.json")
PPQ_KEY, UNSPLASH_KEY = os.getenv("PPQ_API_KEY"), os.getenv("UNSPLASH_ACCESS_KEY")
PPQ_MODEL = os.getenv("PPQ_MODEL", "auto")
LOCK = threading.Lock()

PAGE = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YouTube Factory MVP</title><style>body{font:16px system-ui;max-width:1100px;margin:40px auto;padding:0 16px}textarea,button{font:inherit;padding:10px}textarea{width:100%;min-height:90px;box-sizing:border-box}button{cursor:pointer}.scene{border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0}.assets{display:flex;gap:12px;flex-wrap:wrap}.asset{width:240px}.asset img{width:100%;aspect-ratio:16/9;object-fit:cover}.muted{color:#666}</style><main><h1>YouTube Factory</h1><form id=f><label for=t>Topic</label><textarea id=t required maxlength="500" placeholder="e.g. Why Venice is slowly sinking"></textarea><button>Generate</button></form><p id=s class=muted role=status aria-live=polite></p><aside><h2>History</h2><select id=h aria-label="Saved projects"><option value="">Select a project</option></select></aside><section id=o></section></main><script>
const f=document.querySelector('#f'),s=document.querySelector('#s'),o=document.querySelector('#o'),h=document.querySelector('#h');
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(x){o.innerHTML=x.scenes.map((a,i)=>`<article class=scene><h2>Scene ${i+1}</h2><p>${esc(a.text)}</p><p><b>${esc(a.prompt)}</b></p><div class=assets>${a.assets.map(v=>`<div class=asset><a href="${v.source_url}" target="_blank" rel="noopener"><img src="${v.url}" alt="${esc(v.alt||a.prompt)}"></a><small>${esc(v.creator||'')}</small></div>`).join('')}</div><button type=button onclick="image(this)">Generate AI image</button></article>`).join('')}
async function load(){let r=await fetch('/api/projects'),x=await r.json();if(r.ok)h.innerHTML='<option value="">Select a project</option>'+x.map((p,i)=>`<option value="${i}">${esc(p.title)}</option>`).join('')}
f.onsubmit=async e=>{e.preventDefault();s.textContent='Generating…';o.innerHTML='';try{let r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:t.value})}),x=await r.json();if(!r.ok)throw Error(x.error);render(x);await load();s.textContent=x.title}catch(e){s.textContent=e.message}};
h.onchange=async()=>{if(h.value==='')return;let r=await fetch('/api/projects'),x=await r.json();if(r.ok)render(x[h.value])};
async function image(b){b.disabled=true;try{let r=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:b.parentNode.querySelector('b').textContent})}),x=await r.json();if(!r.ok)throw Error(x.error);let d=document.createElement('div');d.className='asset';d.innerHTML=`<img src="${x.url}" alt="AI generated"><small>AI · ${esc(x.model)}</small>`;b.previousElementSibling.append(d)}catch(e){s.textContent=e.message}finally{b.disabled=false}}
load();
</script></html>'''

def request(url,payload,headers=None):
    r=Request(url,data=json.dumps(payload).encode(),headers={"Content-Type":"application/json",**(headers or {})})
    with urlopen(r,timeout=90) as x:return json.load(x)

def ppq(payload,image=False):
    if not PPQ_KEY:raise RuntimeError("PPQ_API_KEY is not set")
    return request("https://api.ppq.ai/v1/images/generations" if image else "https://api.ppq.ai/chat/completions",payload,{"Authorization":f"Bearer {PPQ_KEY}"})

def script(topic):
    p='Return JSON only: {"title":"...","scenes":[{"text":"...","prompt":"..."}]} for a YouTube video about %s. Make 3-6 concise scenes, each with spoken text and a concrete image prompt.'%topic
    x=ppq({"model":PPQ_MODEL,"messages":[{"role":"user","content":p}]})["choices"][0]["message"]["content"]
    x=json.loads(x[x.find("{"):x.rfind("}")+1])
    if not isinstance(x.get("title"),str) or not isinstance(x.get("scenes"),list) or not 1<=len(x["scenes"])<=12:raise ValueError("LLM returned an invalid script")
    for a in x["scenes"]:
        if not isinstance(a,dict) or not isinstance(a.get("text"),str) or not isinstance(a.get("prompt"),str):raise ValueError("LLM returned an invalid scene")
    return x

def stock(q):
    if not UNSPLASH_KEY:return []
    r=Request("https://api.unsplash.com/search/photos?per_page=1&query="+quote(q),headers={"Authorization":"Client-ID "+UNSPLASH_KEY})
    with urlopen(r,timeout=20) as x:d=json.load(x)
    return [{"provider":"unsplash","external_id":p["id"],"url":p["urls"]["regular"],"source_url":p["links"]["html"]+"?utm_source=youtubefactory&utm_medium=referral","creator":p["user"]["name"],"license":"Unsplash License","alt":p.get("alt_description") or q} for p in d["results"]]

def projects():
    try:return json.loads(DATA.read_text(encoding="utf-8")) if DATA.exists() else []
    except (OSError,json.JSONDecodeError):return []

def save(x):
    with LOCK:
        xs=projects();xs.insert(0,x);DATA.write_text(json.dumps(xs[:20],ensure_ascii=False,indent=2),encoding="utf-8")

class App(BaseHTTPRequestHandler):
    def send(self,code,body,typ="application/json"):
        raw=body if isinstance(body,bytes) else body.encode();self.send_response(code);self.send_header("Content-Type",typ+"; charset=utf-8");self.send_header("Content-Length",str(len(raw)));self.send_header("Cache-Control","no-store");self.end_headers();self.wfile.write(raw)
    def read(self):
        n=int(self.headers.get("Content-Length",0))
        if n>10000:raise ValueError("Request too large")
        return json.loads(self.rfile.read(n) or b"{}")
    def do_GET(self):
        if self.path=="/":return self.send(200,PAGE,"text/html")
        if self.path=="/api/projects":return self.send(200,json.dumps(projects()))
        return self.send(404,json.dumps({"error":"Not found"}))
    def do_POST(self):
        try:
            b=self.read()
            if self.path=="/api/generate":
                topic=b.get("topic","").strip()
                if not 1<=len(topic)<=500:raise ValueError("Topic must be 1–500 characters")
                x=script(topic)
                for a in x["scenes"]:a["assets"]=stock(a["prompt"])
                x["topic"]=topic;save(x);return self.send(200,json.dumps(x))
            if self.path=="/api/image":
                p=b.get("prompt","").strip()
                if not p or len(p)>2000:raise ValueError("Prompt must be 1–2000 characters")
                x=ppq({"model":"nano-banana-2","prompt":p,"n":1},True);d=x["data"][0]
                if not d.get("url"):raise RuntimeError("Image provider returned no URL")
                return self.send(200,json.dumps({"url":d["url"],"model":x.get("model","nano-banana-2")}))
            self.send(404,json.dumps({"error":"Not found"}))
        except (ValueError,KeyError,TypeError,IndexError,json.JSONDecodeError) as e:self.send(400,json.dumps({"error":str(e)}))
        except Exception as e:self.send(502,json.dumps({"error":str(e)}))

if __name__=="__main__":ThreadingHTTPServer(("127.0.0.1",int(os.getenv("PORT",8000))),App).serve_forever()
