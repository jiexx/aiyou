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

type Configuration struct {
	Target string `json:"target"`
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
	this.status = 1
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
			this.status = 0
			log.Fatal("failed to kill: ", err)
		}
		log.Println("process killed as timeout reached")
	case err := <-done:
		this.status = 0
		if err == nil {
			this.mgr.end(out);
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
	conf := Configuration{"127.0.0.1"};
	mgr := Manager{TaskQueue:[]string{}, c_request:make(chan string), c_response:make(chan string), config:conf, workers:make([]Worker, 3)};
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