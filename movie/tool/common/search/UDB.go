//https://gist.github.com/blinksmith/99e5234ea601af8ba8bfab35c8fbebef 
package search

import (
	"log"
	"os/exec"
	"encoding/json"
	"net/http"
	"reflect"
	"fmt"
	"bytes"
	"strings"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

type UDB struct {
	dbname string
	userid string
	db DB
}

var _dbs * map[string]UDB = nil
func _getDBS() []UDB {
	if !_dbs {
		once.Do(func() {
			_dbs = & make(map[string]UDB);
		})
	}
	return *_dbs
}
func checkErr(err error) {
    if err != nil {
        panic(err)
    }
}
func (this *UDB) get(userid string) UDB {
	dbs := _getDBS()
	d, ok := dbs[userid]
	if !ok {
		cfg := getConfig()
		d.db, ok = sql.Open("mysql", cfg.mysql_jdbc)
		if ok {
			stmt, err := d.db.Prepare("CREATE DATABASE "+d.dbname)
			checkErr(err)

			res, err := stmt.Exec()
			checkErr(err)

			affect, err = res.RowsAffected()
			checkErr(err)
			
			d.db.userid = userid
			d.db.Close()
		}
	}
}
func (this *UDB) get(userid string, colname string) UDB {
	
}

