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
type Configuration struct {
	Target string `json:"target"`
	Options Option `json:"options"`
}


type Selector struct {
	father *Page 
	xpath string
	prefix string
	attr string
	out string
	next *Page
}
func (this *Selector)toString() string{
	return fmt.Sprint("{expr:%s,prefix:%s,attr:%s}", this.xpath, this.prefix, this.attr);
}
type Page struct {
	url string
	values []Selector
	links []Selector
}
func (this *Selector)toString() string{
	return fmt.Sprint("{url:%s,prefix:%s,attr:%s}", this.url, this.prefix, this.attr);
}
type Task struct {
	root Page
	workers []Worker
	c_request chan string
	c_response chan string
}
type Master struct {
	tasks []Task
	config Configuration
	mgrs []string
	c_request chan string
	c_response chan string
}

func newMaster() Master {
	conf := Configuration{"127.0.0.1",Option{false,false,30000,"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36",10,30000}};
	mgr := Master{TaskQueue:[]Job{}, c_request:make(chan Job), c_response:make(chan string), config:conf, workers:make([]Worker, 3)};
	return mgr;
}
func (this *Manager)configuare(cfg string) bool{
	var config Configuration;
	err := json.Unmarshal([]byte(cfg), &config)
	if err == nil {
		this.config = config;
		return true
	}
	return false
}
func (this *Manager)start(str string) {
	this.c_request <- str;
}
func (this *Manager)end(str string) {
	this.c_response <- str;
}
func (this *Manager)request(job string) {
	count := len(this.workers);
	i := 0;
	for ; i < count ; i ++ {
		if this.workers[i].isFree() {
			this.workers[i].doTask(job)
			break
		}
	}
	if i == count {
		append(this.TaskQueue, job);
	}
}
func (this *Manager)response(str string) {
	resp, err := http.PostForm(this.conf.Target, url.Values{"err":false, "result": str})
    if err != nil {
        // handle error
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        // handle error
    }
    fmt.Println(string(body))
	if len(this.TaskQueue) > 0 {
		job := this.TaskQueue[0]
		this.TaskQueue = append(this.TaskQueue[:0], this.TaskQueue[1:]...);
		this.start(job)
	}
}
func (this *Manager)loop() {
	go func() {
		for {
			select {
			case req <- this.c_request:
				this.request(req);
			case res <- this.c_response:
				this.response(res);
			}
		}
	}()
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