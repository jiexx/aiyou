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
func qryReturn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		response(w, mgr.Recv(fmt.Sprint(r.Request.Body)) )
	}
}

func userCaptcha(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query()["um"]
	if r.Method == "GET" && um != nil {
		response(w, mgr.CAPTCHA(um) )
	}
}
func userRegister(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query()["um"]
	pwd := r.URL.Query()["pwd"]
	captcha := r.URL.Query()["cap"]
	if r.Method == "GET" && um != nil && pwd != nil && captcha != nil {
		response(w, mgr.Register(um, pwd, captcha) )
	}
}
func userLogin(w http.ResponseWriter, r *http.Request) {
	userid := r.URL.Query()["uid"]
	if r.Method == "GET" && userid != nil {
		response(w, mgr.Login(uid) )
	}
}
func userPwdLogin(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query()["um"]
	pwd := r.URL.Query()["pwd"]
	if r.Method == "GET" && um != nil && pwd != nil {
		response(w, mgr.Pwdlogin(um, pwd) )
	}
}
func userTasks(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query()["uid"]
	if r.Method == "GET" && uid != nil {
		response(w, mgr.GetUserTasks(uid) )
	}
}
func userSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" && tid != nil && uid != nil {
		response(w, mgr.Start(uid, tid) )
	}
}
func taskSave(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		response(w, mgr.Save(fmt.Sprint(r.Request.Body)) )
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
	mux.HandleFunc("/user/captcha", userCaptcha);
	mux.HandleFunc("/user/register", userRegister);
	mux.HandleFunc("/user/login", userLogin);
	mux.HandleFunc("/user/pwdlogin", userPwdLogin);
	mux.HandleFunc("/user/tasks", userTasks);
	mux.HandleFunc("/user/settings", userSettingsSave);
	mux.HandleFunc("/user/settings/save", userSettingsSave);
	mux.HandleFunc("/task/save", taskSave);
	mux.HandleFunc("/task/start", taskStart);
	mux.HandleFunc("/querior/return", qryReturn);
	//mux.HandleFunc("/task/pause", ConfigUpdate);

	http.Handle("/html/", http.StripPrefix("/html/", http.FileServer(http.Dir("/"))));
	http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("/lib"))));
	http.ListenAndServe(":8066", mux);  
}