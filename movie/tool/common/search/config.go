//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef
package search

import (
	"encoding/json"
	"os"
	"sync"
)

type cfdog struct {
	Iport string
	Path  string
}

type cfquerior struct {
	Iport string
	Path  string
}

func (this *cfquerior) getPostQueriorURL() string {
	return this.Iport + this.Path
}

type settings struct {
	loadImages   bool
	loadPlugins  bool
	timeout      int
	userAgent    string
	retryTimeout int
	waitTimeout  int
}

type config struct {
	Dog       cfdog       `json:"dog"`
	Queriors  []cfquerior `json:"queriors"`
	MysqlJdbc string      `json:"mysql_jdbc"`
	Titan     string      `json:"titan"`
}

var _cfg *config = nil
var _cfgonce sync.Once

func SetConfig(path string) {
	if _cfg == nil {
		_cfgonce.Do(func() {
			_cfg = &config{}
			file, _ := os.Open(path)
			decoder := json.NewDecoder(file)
			err := decoder.Decode(_cfg)
			checkErr(err)
		})
	}
}
func GetConfig() *config {
	return _cfg
}

func (this *config) GetManager() cfdog {
	return this.Dog
}
func (this *config) GetQueriorReturnURL() string {
	return this.Dog.Iport + this.Dog.Path
}

func (this *config) GetQueriors() []cfquerior {
	return this.Queriors
}

func (this *config) GetMysqlJDBC() string {
	return this.MysqlJdbc
}
