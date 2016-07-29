//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package main

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
)

type Option struct {
	LoadImages bool `json:"loadImages"`
	LoadPlugins bool `json:"loadPlugins"`
	Timeout int `json:"timeout"`
	UserAgent string `json:"userAgent"`
	RetryTimeout int `json:"retryTimeout"`
	WaitTimeout int `json:"waitTimeout"`
}
func (g Option) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "loadImages": g.LoadImages,  
        "loadPlugins": g.LoadPlugins,  
        "timeout": g.Timeout,  
		"userAgent": g.UserAgent,  
		"retryTimeout": g.RetryTimeout,  
		"waitTimeout": g.WaitTimeout, 
    })  
}
type Configuration struct {
	Addr string `json:"target"`
	Options Option `json:"options"`
}
func (g Configuration) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "target": g.Addr,  
        "options": g.Options,  
    })  
}
type Selector struct {
	father *Page 
	expr string
	prefix string
	attr string
	result string
	next *Page
}
type Result struct {
	Path string
	Out string
}

func (this *Selector)String() string{
	return fmt.Sprintf("{expr:%s,prefix:%s,attr:%s}", this.expr, this.prefix, this.attr);
}
type Page struct {
	url string
	values []Selector
	links []Selector
}
func newPage(u string) Page {
	t := Page{url:u, next:nil, prev:nil};
	return t;
}
func (this Page) clone() Page {
	return nil;
}
func (this Page) String() string {
	var a []Selector;
	a = append(a, this.values...);
	a = append(a, this.links...);
	return fmt.Sprint(a);
}
func (this *Page)fill(res []Result) {
	for i := 0 ; i < len(res) ; i ++ {
		for v := 0 ; v < len(this.values) ; v ++ {
			if this.values[v].expr == res[i].Path {
				this.values[v].result = res[i].out
			}
		}
		for k := 0 ; k < len(this.links) ; k ++ {
			if this.links[k].expr == res[i].Path {
				this.links[k].result = res[i].out
			}
		}
	}
}
func (this *Page)getLinks(res []Result) []string{
	var a []string
	for k := 0 ; k < len(this.links) ; k ++ {
		if this.links[k].result != "" {
			append(a, this.links[k].result)
		}
	}
	return a
}
func (this *Page)makeLinkPage(res []Result) []string{
	var a []string
	for k := 0 ; k < len(this.links) ; k ++ {
		if this.links[k].result != "" {
			append(a, this.links[k].result)
		}
	}
	return a
}

type Querier struct {
	addr string
	task *Task
	next *Querier
	prev *Querier
}
func (this *Querier)doTask(args string) bool {
	if this.task == nil {
		resp, err := http.PostForm(this.addr, url.Values{"err":false, "result": str})
		if err != nil {
			// handle error
			return false
		}
		defer resp.Body.Close()
		this.task = task
		return true
	}
	return false
}
type QuerierManager struct {
	freeQuerier *Querier
	busyQuerier map[string]*Querier
}
func newQuerierManager(n) QuerierManager {
	qm := QuerierManager{freeQuerier:nil, busyQuerier:make(map[string]*Querier)};
	return qm;
}
func (this *QuerierManager)enQueue(q *Querier)  {
	if this.freeQuerier == nil {
		this.freeQuerier = q
		q.prev = q
		q.next = q
	}else {
		this.freeQuerier.prev.next = q
		q.prev = this.freeQuerier.prev
		q.next = this.freeQuerier
		this.freeQuerier.prev = q
	}
}
func (this *QuerierManager)head()  {
	return this.freeQuerier
}
func (this *QuerierManager)deQueue(q *Querier)  {
	if this.freeQuerier == nil || q.next == nil || q.prev == nil {
		return
	}
	if this.freeQuerier == q {
		this.freeQuerier = nil
	}
	this.busyQuerier[q.addr] = q
	q.prev.next = q.next
	q.next.prev = q.prev
	q.next = nil
	q.prev = nil
}
func (this *QuerierManager)taskOnFinish(addr string)  {
	q, ok := this.busyQuerier[addr]
	if ok {
		q.task = nil
		delete(this.busyQuerier, addr)
		this.enQueue(q)
	}
}
	
type Task struct {
	page Page
	next *Task
	prev *Task
}
func newTask() Task {
	t := Task{page:newPage(), next:nil, prev:nil};
	return t;
}
type TaskManager struct {
	freeTask *Task
	finishTask *Task
	busyTask map[string]*Task
}
func newTaskManager() TaskManager {
	tm := TaskManager{freeTask:nil, busyTask:make(map[string]*Task)};
	return tm;
}
func (this *TaskManager)enQueue(t *Task)  {
	if this.freeTask == nil {
		this.freeTask = t
		t.prev = t
		t.next = t
	}else {
		this.freeTask.prev.next = t
		t.prev = this.freeTask.prev
		t.next = this.freeTask
		this.freeTask.prev = t
	}
}
func (this *TaskManager)head()  {
	return this.freeTask
}
func (this *TaskManager)deQueue(t *Task)  {
	if this.freeTask == nil || t.next == nil || t.prev == nil {
		return
	}
	if this.freeTask == t {
		this.freeTask = nil
	}
	this.busyTask[t.page.url] = t
	t.prev.next = t.next
	t.next.prev = t.prev
	t.next = nil
	t.prev = nil
}
func (this *TaskManager)taskOnFinish(url string, res []Result)  {
	t, ok := this.busyTask[url]
	if ok {
		delete(this.busyTask, url)
		for i := 0 ; i < len(res) ; i ++ {
			
		}
	}
}


type Master struct {
	qm QuerierManager
	tm TaskManager
	config Configuration
}
func newMaster() Master {
	conf := Configuration{"127.0.0.1",Option{false,false,30000,"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36",10,30000}};
	mgr := Master{config:conf};
	return mgr;
}
func (this *Master)run()  {
	for q := this.qm.head() ; q != nil && q.next != this.qm.head() ; q = q.next {
		var task = this.tm.head()
		if task != nil {
			if q.doTask(task, this.makeTaskStr(task)) {
				this.qm.deQueue(q)
				this.tm.deQueue(task)
			}
		}
	}
}
func (this *Master)taskOnFinish(addr string , url string)  {
	this.qm.taskOnFinish(addr)
	this.tm.taskOnFinish(url)
}
func (this *Master)configuare(cfg string) bool{
	var config Configuration;
	err := json.Unmarshal([]byte(cfg), &config)
	if err == nil {
		this.config = config;
		return true
	}
	return false
}
func (this *Master)makeTaskStr(t Task) string {
	conf, _ := json.Marshal(this.config);
	return fmt.Sprintf("{url:%s,target:%s,options:%s,selector:%s}", t.page.url, this.config.Addr, conf, t.page);
}

var mgr Manager;
func Query(w http.ResponseWriter, r *http.Request) {
	result := false;
	var order_req OrderRequest;
	if r.Method == "POST" {
		mgr.start(fmt.Sprint(r.Request.Body))
		str := fmt.printf("{'err':%b}", err)
		w.Header().Set("Access-Control-Allow-Origin", "*");
		w.Write([]byte(str));
	}
}

func Config(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		err := mgr.configuare(fmt.Sprint(r.Request.Body))
		str := fmt.printf("{'err':%b}", err)
		w.Write([]byte(str));
	}
}

func main() {
	mgr = newManager();
	mgr.loop();
	mux := http.NewServeMux();
 	mux.HandleFunc("/query", Query);
	mux.HandleFunc("/config", Config);
	http.ListenAndServe(":8061", mux);  
}