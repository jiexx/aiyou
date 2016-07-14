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
	expr string;			//css selector
	prefix string;			//maybe attributes
	attr string;			//maybe href(prefix=attributes)/height/text
}
type Job struct {
	url string
	selector Selector
}
func (a Job) MarshalJSON() ([]byte, error) {  
    return json.Marshal(map[string]interface{}{  
		"url": a.url,  
        "selector": a.selector,  
    })  
} 
type Worker struct {
	mgr *Manager
	status int
	mux sync.Mutex
}
func newWorker(m *Manager) Worker {
	worker := Worker{mgr:m, status:0};
	return worker;
}
func (this *Worker)isFree() bool{
	return status == 0
}
func (this *Worker)doTask(job string) {
	cmd := exec.Command("casperjs Querier.js", job)
	out, _ := cmd.StdoutPipe();
	cmd.Start()
	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()
	select {
	case <-time.After(60 * time.Second):
		if err := cmd.Process.Kill(); err != nil {
			log.Fatal("failed to kill: ", err)
		}
		log.Println("process killed as timeout reached")
	case err := <-done:
		if err == nil {
			this.mgr.notify2(out);
		}
	}
}

type Manager struct {
	TaskQueue []string
	mux sync.Mutex
	config Configuration
	workers []Worker
	c_request chan string
	c_response chan string
}
func newManager() Manager {
	conf := Configuration{"127.0.0.1",Option{false,false,30000,"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36",10,30000}};
	mgr := Manager{TaskQueue:[]Job{}, c_request:make(chan Job), c_response:make(chan string), config:conf, workers:make([]Worker, 3)};
	return mgr;
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
func (this *Manager)notify1(str string) {
	this.c_request <- str;
}
func (this *Manager)notify2(str string) {
	this.c_response <- str;
}
func (this *Manager)response(str string) {
	resp, err := http.PostForm(this.conf.Target, url.Values{"result": {str})
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
		this.request(job)
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



func Query(w http.ResponseWriter, r *http.Request) {
	result := false;
	var order_req OrderRequest;
	if r.Method == "POST" {
		var args []string
		args := r.Request.Body
		defer r.Request.Body.Close()
		cmd := exec.Command("casperjs Querier.js", args)
		
		out, _ := cmd.StdoutPipe();
		cmd.Start()
		done := make(chan error, 1)
		go func() {
			done <- cmd.Wait()
		}()
		select {
		case <-time.After(60 * time.Second):
			if err := cmd.Process.Kill(); err != nil {
				log.Fatal("failed to kill: ", err)
			}
			log.Println("process killed as timeout reached")
		case err := <-done:
			if err == nil {
				Return(out);
			}
		}
	}
	w.Header().Set("Access-Control-Allow-Origin", "*");
	if result == true {
		w.Write([]byte(js));
	}else {
		js, _ := json.Marshal(OrderResponse{Result:result, Order_id:"0", Clazz:order_req.Clazz, Price:order_req.Price, Amount:order_req.Amount});
		w.Write([]byte(js));
	}
}

func Config() {
}

func Loop() {
	for {
		select {
			
		}
	}
}

func main() {
	mux := http.NewServeMux();
 	mux.HandleFunc("/query", Query);
	mux.HandleFunc("/config", Config);
	http.ListenAndServe(":8081", mux);  
}