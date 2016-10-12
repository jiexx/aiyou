//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"os"
	"sync"
	"encoding/json"
)

type cfdog struct {
	iport string
}

type cfqrier struct {
	iport string
}

type settings struct {
	loadImages bool
	loadPlugins bool
	timeout int
	userAgent string	
	retryTimeout int
	waitTimeout int
}

type config struct {
	dog cfdog
	cfqs []cfqrier
	mysql_jdbc string
	titan string
}

var _cfg *config = nil
var _cfgonce sync.Once
func getConfig() config {
	if _cfg == nil {
		_cfgonce.Do(func() {
			_cfg = &config{};
			file, _ := os.Open("conf.json")
			decoder := json.NewDecoder(file)
			err := decoder.Decode(_cfg)
		})
	}
	return *_cfg
}

