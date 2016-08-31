//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package main

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"strings"
)

DB, _ := sql.Open("mysql", "root:1234@127.0.0.1")


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
	expr string
	prefix string
	attr string
	name string
	next *Page
}
func (g Selector) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "expr": g.expr,  
        "prefix": g.prefix,  
        "attr": g.attr,
		"name": g.name,
		"next": g.next,
    })  
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
func (g Page) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
        "time": g.url,  
        "values": g.values,  
        "links": g.links  
    })  
}
func newPage(u string) Page {
	t := Page{url:u, values:[]Selector{}, links:[]Selector{}};
	return t;
}
func (this *Page) update(p *Page) {
	this.url = p.url;
	this.values = p.values;
	this.links = p.links;
}
func (this *Page) String() []string {
	var a []Selector
	a = append(a, this.values...)
	a = append(a, this.links...)
	return a;
}
func (this *Page) getFieldNames() []string {
	var a []string
	for i := 0 ; i < len(this.links) ; i ++ {
		a = append(a, fmt.Sprintf("%s varchar(512)",this.links[i]))
	}
	for j := 0 ; j < len(this.values) ; j ++ {
		a = append(a, fmt.Sprintf("%s varchar(512)",this.values[i]))
	}
	return a;
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

type Querier struct {
	addr string
	task *Task
	next *Querier
	prev *Querier
}
func (this *Querier)doTask(t Task, args string) bool {
	if this.task == nil {
		resp, err := http.PostForm(this.addr, url.Values{"err":false, "result": str})
		if err != nil {
			// handle error
			return false
		}
		defer resp.Body.Close()
		this.task = t
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
	name string
	page Page
	next *Task
	prev *Task
}
func newTask(n *String) Task {
	t := Task{name:n, page:newPage(""), next:nil, prev:nil};
	sql := fmt.Sprint("CREATE TABLE Querier.%s(%s);", this.name, strings.Join(t.page.getFieldNames(), ","))
	rows, _ := DB.Query(sql)
	return t;
}

type TaskManager struct {
	freeTask *Task
	busyTask map[string]*Task
	mux sync.Mutex;
	c_task chan int;
}
type TaskList struct {
	Name string
	Status string
}
func newTaskManager() TaskManager {
	tm := TaskManager{freeTask:nil, busyTask:make(map[string]*Task)};
	return tm;
}
func (this *TaskManager)refreshTaskPage(t *Task)  {
	go func() {
		this.enQueue(t);
		this.c_task <- 1;
	}()
}
func (this *TaskManager)enQueue(t *Task)  {
	this.mux.Lock();
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
	this.mux.Unlock();
}
func (this *TaskManager)head()  {
	return this.freeTask
}
func (this *TaskManager)String() string {
	var tl []TaskList;
	for q := this.freeTask ; q != nil && q.next != this.freeTask ; q = q.next {
		tl = append(tl, TaskList{name:q.name, status:"free"});
	}
	for k, v := range this.busyTask {
		tl = append(tl, TaskList{name:v.name, status:"busy"});
	}
	js, _ := json.Marshal(tl);
	return js;
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
func (this *TaskManager)_update(t *Task, res []Result){
	var a []string
	var b []string
	var page = t.page;
	for k := 0 ; k < len(res) ; k ++ {
		for i := 0 ; i < len(page.links) ; i ++ {
			if page.links[i].expr == res[k].Path {
				if page.links[i].next != nil {
					page.links[i].next.url = res[k].Out
					this.refreshTaskPage(t);
				}
				a = append(a, page.values[k].name)
				b = append(b, res[k].Out)
			}
		}
		for j := 0 ; j < len(page.values) ; j ++ {
			if page.values[j].expr == res[k].Path {
				a = append(a, page.values[k].name)
				b = append(b, res[k].Out)
			}
		}
	}
	sql := fmt.Sprint("INSERT INTO Querier.%s(%s)VALUES(%s);", this.task.name, strings.Join(a, ","), strings.Join(b, ",") )
	rows, _ := DB.Query(sql)
}
func (this *TaskManager)taskOnFinish(url string, res []Result)  {
	t, ok := this.busyTask[url]
	if ok {
		delete(this.busyTask, url)
		this._update(&t, res);		
	}
}

var master Master;
type Master struct {
	qm QuerierManager
	tm TaskManager
	config Configuration
}
type Res struct {
	URL string
	ADDR string
	RESULT Result
}
func newMaster() Master {
	conf := Configuration{"127.0.0.1",Option{false,false,30000,"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36",10,30000}};
	mgr := Master{config:conf};
	return mgr;
}
func (this *Master)makeTaskStr(t Task) string {
	conf, _ := json.Marshal(this.config);
	return fmt.Sprintf("{url:%s,target:%s,options:%s,selector:%s}", t.page.url, this.config.Addr, conf, t.page);
}
func (this *Master)run()  {
	for {
		select {
		case <- this.tm.c_task:
			this.tm.mux.Lock();
			for q := this.qm.head() ; q != nil && q.next != this.qm.head() ; q = q.next {
				var task = this.tm.head()
				if task != nil {
					if q.doTask(task, this.makeTaskStr(task)) {
						this.qm.deQueue(q)
						this.tm.deQueue(task)
					}
				}
			}
			this.tm.mux.Unlock();
		}
	}
}
func (this *Master)taskOnFinish(rs string)  {
	var res Res
	err := json.Unmarshal([]byte(rs), &res)
	if err == nil {
		this.qm.taskOnFinish(res.ADDR)
		this.tm.taskOnFinish(res.URL, )
	}
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

func TaskList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		w.Write([]byte(fmt.Sprint(master.tm)));
	}
}
type TaskItem struct {
	Name string
	Pager Page
}
func TaskInsert(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Request.Body)
		var ti TaskItem   
		err := decoder.Decode(&ti)
		if err == nil {
			master.tm.enQueue(newTask(ti.Name));
			w.Write([]byte("ok"));
		}
	}
}
func TaskDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Request.Body)
		var ti TaskItem   
		err := decoder.Decode(&ti)
		if err == nil {
			for t := master.tm.head() ; t != nil && t.next != master.tm.head() ; t = t.next {
				if ti.Name == t.name {
					this.tm.deQueue(t)
					break
				}
			}
			w.Write([]byte("ok"));
		}
	}
}
func PageList(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Request.Body)
		var ti TaskItem   
		err := decoder.Decode(&ti)
		if err == nil {
			for t := master.tm.head() ; t != nil && t.next != master.tm.head() ; t = t.next {
				if ti.Name == t.name {
					js, _ := json.Marshal(ti.page);
					w.Write([]byte(js));
					break
				}
			}
		}
	}
}
func PageUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Request.Body)
		var ti TaskItem   
		err := decoder.Decode(&ti)
		if err == nil {
			for t := master.tm.head() ; t != nil && t.next != master.tm.head() ; t = t.next {
				if ti.Name == t.name {
					t.update(ti.Pager);
					w.Write([]byte("ok"));
					break
				}
			}
		}
	}
}
type PageItem struct {
	URL string
	Expr string
	Pager Page
}
func PageInsert(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		decoder := json.NewDecoder(r.Request.Body)
		var ti TaskItem   
		err := decoder.Decode(&ti)
		if err == nil {
			for t := master.tm.head() ; t != nil && t.next != master.tm.head() ; t = t.next {
				if ti.Name == t.name {
					t.update(ti.Pager);
					w.Write([]byte("ok"));
					break
				}
			}
		}
	}
}

func main() {
	master = newMaster();
	
	mux := http.NewServeMux();
 	mux.HandleFunc("/task/list", TaskList);
	mux.HandleFunc("/task/insert", TaskInsert);
	mux.HandleFunc("/task/delete", TaskDelete);
	mux.HandleFunc("/page/list", PageList);
	mux.HandleFunc("/page/update", PageUpdate);
	mux.HandleFunc("/page/insert", PageInsert);
	mux.HandleFunc("/config", Config);
	http.Handle("/html/", http.StripPrefix("/html/", http.FileServer(http.Dir("/"))));
	http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("/lib"))));
	http.ListenAndServe(":8066", mux);  
}