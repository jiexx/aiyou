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
	"search"
)

var mgr *search.manager;


func response(w http.ResponseWriter, error bool) {
	str := fmt.printf("{err:%b}",error)
	w.Header().Set("Access-Control-Allow-Origin", "*");
	w.Write([]byte(str));
}

func taskSave(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		response(w, mgr.Save(fmt.Sprint(r.Request.Body)) )
	}
}

func qryReturn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		response(w, mgr.Recv(fmt.Sprint(r.Request.Body)) )
	}
}

func taskStart(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query()["tid"]
	uid := r.URL.Query()["uid"]
	if r.Method == "GET" && tid != nil && uid != nil {
		response(w, mgr.Start(uid, tid) )
	}
}

func main() {
	mgr = getManager();
	
	mux := http.NewServeMux();
	mux.HandleFunc("/task/save", taskSave);
	mux.HandleFunc("/task/start", taskStart);
	mux.HandleFunc("/querior/return", qryReturn);
	mux.HandleFunc("/querior/config", qryConfig);
	//mux.HandleFunc("/task/pause", ConfigUpdate);

	http.Handle("/html/", http.StripPrefix("/html/", http.FileServer(http.Dir("/"))));
	http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("/lib"))));
	http.ListenAndServe(":8066", mux);  
}