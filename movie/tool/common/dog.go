//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package main

import (
	//"log"
	//"os/exec"
	//"encoding/json"
	"net/http"
	//"reflect"
	"fmt"
	//"strings"
	"./search"
	"io/ioutil"
)

var mgr = search.GetManager()


func response(w http.ResponseWriter, result string) {
	w.Header().Set("Access-Control-Allow-Origin", "*");
	if result == "failed." {
		w.Write([]byte("{err:1}"));
	}else {
		str := fmt.Sprintf("{err:0, result:%s}", result)
		w.Write([]byte(str));
	}
}
func qryReturn(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		response(w, mgr.Recv(fmt.Sprint(r.Body)) )
	}
}

func userCaptcha(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	if r.Method == "GET" && um != "" {
		response(w, mgr.CAPTCHA(um) )
	}
}
func userRegister(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	pwd := r.URL.Query().Get("pwd")
	captcha := r.URL.Query().Get("cap")
	if r.Method == "GET" && um != "" && pwd != "" && captcha != "" {
		response(w, mgr.Register(um, pwd, captcha) )
	}
}
func userLogin(w http.ResponseWriter, r *http.Request) {
	userid := r.URL.Query().Get("uid")
	if r.Method == "GET" && userid != "" {
		response(w, mgr.Login(userid) )
	}
}
func userPwdLogin(w http.ResponseWriter, r *http.Request) {
	um := r.URL.Query().Get("um")
	pwd := r.URL.Query().Get("pwd")
	if r.Method == "GET" && um != "" && pwd != "" {
		response(w, mgr.Pwdlogin(um, pwd) )
	}
}
func userTasks(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && uid != "" {
		response(w, mgr.GetUserTasks(uid) )
	}
}
func userSettings(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && uid != "" {
		response(w, mgr.GetUserSettings(uid) )
	}
}
func userSettingsSave(w http.ResponseWriter, r *http.Request) {
	htmlData, err := ioutil.ReadAll(r.Body)
	if err != nil {
 		response(w, "failed.")
 	}
	if r.Method == "POST" && htmlData != nil {
		response(w, mgr.SaveUserSettings(string(htmlData)) )
	}
}
func taskSave(w http.ResponseWriter, r *http.Request) {
	htmlData, err := ioutil.ReadAll(r.Body)
	if err != nil {
 		response(w, "failed.")
 	}
	if r.Method == "POST" {
		response(w, mgr.Save(string(htmlData)) )
	}
}
func taskStart(w http.ResponseWriter, r *http.Request) {
	tid := r.URL.Query().Get("tid")
	uid := r.URL.Query().Get("uid")
	if r.Method == "GET" && tid != "" && uid != "" {
		response(w, mgr.Start(uid, tid) )
	}
}



func main() {
	mux := http.NewServeMux();
	mux.HandleFunc("/user/captcha", userCaptcha);
	mux.HandleFunc("/user/register", userRegister);
	mux.HandleFunc("/user/login", userLogin);
	mux.HandleFunc("/user/pwdlogin", userPwdLogin);
	mux.HandleFunc("/user/tasks", userTasks);
	mux.HandleFunc("/user/settings", userSettings);
	mux.HandleFunc("/user/settings/save", userSettingsSave);
	mux.HandleFunc("/task/save", taskSave);
	mux.HandleFunc("/task/start", taskStart);
	mux.HandleFunc("/querior/return", qryReturn);
	//mux.HandleFunc("/task/pause", ConfigUpdate);

	http.Handle("/html/", http.StripPrefix("/html/", http.FileServer(http.Dir("/"))));
	http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("/lib"))));
	http.ListenAndServe(":8066", mux);  
}